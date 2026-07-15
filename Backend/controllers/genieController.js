import axios from "axios";
import Booking from "../models/bookingModel.js";
import Bus from "../models/busModel.js";
import { sendSMS } from "../utils/smsService.js";

const sanitizeUrl = (url) => url?.toString().trim().replace(/\/+$/, "");
export const getGenieBaseUrl = () => {
    const override = sanitizeUrl(process.env.GENIE_BASE_URL);
    if (override && override.toLowerCase().includes("genie")) {
        return override;
    }
    return process.env.GENIE_ENV === "production"
        ? "https://api.geniebiz.lk"
        : "https://sandbox-api.geniebiz.lk";
};

/**
 * Initiate Genie Payment
 */
export const initiateGeniePayment = async (req, res) => {
    try {
        const { bookingId, customerDetails, selectedSeats } = req.body;

        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required" });
        }

        // ✅ CRITICAL: Verify booking exists first
        const booking = await Booking.findOne({ bookingId });
        if (!booking) {
            console.error(`❌ Booking not found: bookingId=${bookingId}`);
            return res.status(404).json({ 
                success: false, 
                message: `Booking #${bookingId} not found. Please ensure your booking was created successfully.` 
            });
        }

        // ✅ Validate Genie API credentials are configured
        if (!process.env.GENIE_API_KEY) {
            console.error("⚠️ GENIE_API_KEY is missing in environment variables.");
            return res.status(500).json({ 
                success: false, 
                message: "Server configuration error: Genie API key not configured. Please contact support." 
            });
        }

        // Use booking.totalAmount directly from database to prevent parameter tampering
        const secureAmount = booking.totalAmount;
        if (!secureAmount || isNaN(Number(secureAmount)) || secureAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid booking amount in database" });
        }

        // Format phone number to 94XXXXXXXXX format
        let formattedPhone = customerDetails?.phone ? customerDetails.phone.replace(/\D/g, "") : "";
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "94" + formattedPhone.substring(1);
        } else if (formattedPhone.length === 9) {
            formattedPhone = "94" + formattedPhone;
        }

        const payload = {
            amount: Math.round(Number(secureAmount) * 100), // Genie expects amount in cents (integer)
            currency: "LKR",
            localId: `${bookingId}-${Date.now()}`, 
            redirectUrl: `${req.headers.origin || "https://mseat.touchmeplus.com"}/booking-confirmation?order_id=${bookingId}`,
            webhook: `${process.env.BACKEND_URL || "https://bus-booking-nt91.onrender.com"}/api/genie/notify`,
            metadata: {
                bookingId: bookingId,
                name: customerDetails?.name || "Guest",
                email: customerDetails?.email || "passenger@example.com"
            }
        };

        const genieUrl = `${getGenieBaseUrl()}/public/v2/transactions`;

        console.log("--- Genie Initiation Request (V2) ---");
        console.log("URL:", genieUrl);
        console.log("Payload:", JSON.stringify(payload, null, 2));

        // Verify that the Genie API key is present
        if (!process.env.GENIE_API_KEY) {
            console.error("⚠️ GENIE_API_KEY is missing in environment variables.");
            return res.status(500).json({ success: false, message: "Server configuration error: Genie API key missing" });
        }
        const response = await axios.post(genieUrl, payload, {
            headers: {
                // ✅ CRITICAL: Authorization header WITHOUT "Bearer" prefix
                "Authorization": process.env.GENIE_API_KEY,
                "Content-Type": "application/json"
            }
        });

        console.log("--- Genie Initiation Response ---");
        console.log("Status:", response.status);
        console.log("Response Data Keys:", Object.keys(response.data || {}));
        console.log("URL field:", response.data?.url);

        // Extract payment URL from Genie response
        const paymentUrl = response.data?.url || response.data?.paymentUrl || response.data?.checkoutUrl;
        const transactionId = response.data?.id || response.data?.transactionId || response.data?.token;

        if (!paymentUrl) {
            console.error("❌ No payment URL in Genie response. Full response:", JSON.stringify(response.data, null, 2));
            throw new Error(response.data?.message || "Genie API did not return payment URL");
        }

        // Save transaction token to booking for verification
        if (transactionId) {
            booking.paymentToken = transactionId;
            await booking.save();
        }

        console.log("✅ Payment URL extracted:", paymentUrl);
        res.status(200).json({ 
            success: true, 
            payment_url: paymentUrl,
            token: transactionId,
            transactionId: transactionId
        });
    } catch (error) {
        console.error("Genie Initiation Error Details:", error.response?.data || error.message);
        
        const genieErrorData = error.response?.data;
        const statusCode = error.response?.status;
        
        // Handle specific Genie API errors
        let userMessage = "Failed to initiate payment";
        
        if (statusCode === 401) {
            userMessage = "❌ Genie API Authentication Failed - Please verify your Genie credentials are valid and properly configured.";
            console.error("⚠️ Genie API returned 401 Unauthorized. Check GENIE_API_KEY and credentials.");
        } else if (statusCode === 403) {
            userMessage = "❌ Genie API Access Denied - Your account may not have payment processing enabled.";
        } else if (statusCode === 400) {
            userMessage = `❌ Invalid Payment Request: ${genieErrorData?.message || "Please verify all payment details are correct."}`;
        } else if (error.code === 'ECONNREFUSED') {
            userMessage = "❌ Cannot reach Genie Payment Service - Network connectivity issue. Please try again.";
        } else {
            userMessage = genieErrorData?.message || genieErrorData?.error || error.message || "Failed to initiate Genie payment";
        }
        
        const genieExtraInfo = genieErrorData?.extraInfo ? JSON.stringify(genieErrorData.extraInfo) : "";
        
        res.status(500).json({ 
            success: false, 
            message: `Genie Payment Error: ${userMessage}`,
            details: genieErrorData,
            extraInfo: genieExtraInfo,
            originalError: error.message
        });
    }
};

/**
 * Genie IPN Callback (Notification)
 */
export const genieNotify = async (req, res) => {
    try {
        console.log("--- Genie Webhook Received ---");
        console.log("Body:", JSON.stringify(req.body, null, 2));

        // Genie sends either 'status' or 'state' - check both
        const { order_id, orderId, localId, status, state, signature, id: transactionId } = req.body;
        const rawStatus = status || state || req.body.transactionStatus;
        const paymentStatus = typeof rawStatus === 'string' ? rawStatus.toUpperCase() : rawStatus; 
        
        // Handle order_id if it's passed as a string or contains extra info (e.g., bookingId-timestamp)
        const receivedOrderId = order_id || orderId || localId;
        if (!receivedOrderId) {
            console.error("Genie Webhook Missing order_id. Body:", req.body);
            return res.status(400).send("Missing order_id");
        }
        
        // Extract numeric bookingId (it might be bookingId-timestamp)
        const cleanOrderId = receivedOrderId.toString().replace(/[^\d-].*/, "").split("-")[0];
        const booking = await Booking.findOne({ bookingId: Number(cleanOrderId) });
        if (!booking) {
            console.warn(`Booking not found for order_id: ${receivedOrderId}, cleanOrderId: ${cleanOrderId}`);
            return res.status(404).send("Booking not found");
        }

        const successStatuses = ["SUCCESS", "CONFIRMED", "COMPLETED", "PAID", "PAYMENT_SUCCESS"];
        
        if (successStatuses.includes(paymentStatus)) {
            // ✅ Verify status via Genie V2 GET API directly to prevent signature/webhook spoofing
            const tokenToVerify = transactionId || booking.paymentToken;
            if (tokenToVerify) {
                try {
                    const genieUrl = `${getGenieBaseUrl()}/public/v2/transactions/${tokenToVerify}`;
                    const verifyResponse = await axios.get(genieUrl, {
                        headers: {
                            "Authorization": process.env.GENIE_API_KEY,
                            "Content-Type": "application/json"
                        }
                    });

                    console.log("--- Genie Webhook Verification Response ---", verifyResponse.data);

                    // ✅ Check multiple possible status fields for robustness
                    // Genie uses 'state' field in its API responses
                    const verifyData = verifyResponse.data || {};
                    const innerData = verifyData.data || {};
                    const resData = verifyData.response || {};
                    
                    const stateValues = [
                        verifyData.state, verifyData.status, verifyData.transactionStatus, verifyData.paymentStatus,
                        innerData.state, innerData.status,
                        resData.state, resData.status
                    ].map(s => typeof s === 'string' ? s.toUpperCase() : null);

                    const isSuccess = stateValues.some(s => s && ["SUCCESS", "CONFIRMED", "COMPLETED", "PAID"].includes(s));

                    if (!isSuccess) {
                        console.warn("Genie API reported transaction was not successful. Rejecting webhook status change.");
                        // Only mark as failed if it's not already cancelled or paid
                        if (booking.paymentStatus !== "CANCELLED" && booking.paymentStatus !== "PAID") {
                            booking.paymentStatus = "FAILED";
                            await booking.save();
                        }
                        return res.status(400).send("Transaction not verified on Genie gateway");
                    }

                    // ✅ Mark as PAID
                    booking.paymentStatus = "PAID";
                    booking.paymentToken = tokenToVerify;
                    await booking.save();

                    // Send SMS
                    const msg = `Booking Confirmed!\nBus: ${booking.bus.name}\nSeats: ${booking.selectedSeats.join(", ")}\nDate: ${booking.searchData.date}\nRef: ${booking.referenceId}\nThank you!`;
                    
                    // 1. Send to Passenger
                    const passengerPhone = booking.passengerDetails?.phone;
                    if (passengerPhone && passengerPhone !== "N/A" && passengerPhone !== "null" && passengerPhone !== "") {
                        sendSMS(passengerPhone, msg);
                    }

                    // 2. ✅ Also notify owner if enabled
                    try {
                        const bus = await Bus.findById(booking.bus.id);
                        if (bus && bus.notifyOwnerOnBooking && bus.ownerPhoneForSMS) {
                            const ownerMsg = `[OWNER COPY] ${msg}`;
                            sendSMS(bus.ownerPhoneForSMS, ownerMsg);
                        }
                    } catch (err) {
                        console.error("Owner SMS failed:", err);
                    }
                    
                    console.log(`✅ Genie Payment Success for Order: ${order_id}`);
                    return res.status(200).send("OK");

                } catch (error) {
                    console.error("Genie Webhook direct verification failed:", error.response?.data || error.message);
                    booking.paymentStatus = "FAILED";
                    await booking.save();
                    return res.status(400).send("Could not verify transaction with Genie API");
                }
            } else {
                console.warn("No transaction token available to verify webhook payment.");
                // We should not cancel it here just because token is missing if we want to be safe, but let's leave it as FAILED
                booking.paymentStatus = "FAILED";
                await booking.save();
                return res.status(400).send("Verification token missing");
            }
        } else {
            // Payment was not successful
            // If the booking is already PAID, do NOT overwrite it with CANCELLED
            if (booking.paymentStatus === "PAID") {
                console.log(`⚠️ Ignored Genie non-success webhook because booking is already PAID for Order: ${receivedOrderId}`);
                return res.status(200).send("OK");
            }

            booking.paymentStatus = "CANCELLED";
            await booking.save();
            console.log(`❌ Genie Payment Failed/Cancelled for Order: ${receivedOrderId} with status: ${paymentStatus}`);
            return res.status(200).send("OK");
        }

    } catch (error) {
        console.error("Genie Notify Error:", error);
        res.status(500).send("Internal Server Error");
    }
};

/**
 * Return a lightweight status of the Genie config (no secrets)
 */
export const getGenieStatus = (req, res) => {
    try {
        res.json({
            env: process.env.GENIE_ENV || null,
            merchantId: process.env.GENIE_MERCHANT_ID ? "SET" : null,
            apiKeySet: !!process.env.GENIE_API_KEY,
            baseUrl: getGenieBaseUrl()
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to read Genie config" });
    }
};

/**
 * ✅ Manual verification endpoint to check payment status with Genie
 * Useful when webhook is delayed or for admin verification
 * GET /api/genie/verify/:bookingId
 */
export const verifyGeniePayment = async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID required" });
        }

        const booking = await Booking.findOne({ bookingId: Number(bookingId) });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // If already paid, no need to verify
        if (booking.paymentStatus === "PAID") {
            return res.status(200).json({ 
                success: true, 
                message: "Payment already confirmed",
                paymentStatus: "PAID",
                booking
            });
        }

        // Verify with Genie API
        const tokenToVerify = booking.paymentToken;
        if (!tokenToVerify) {
            return res.status(400).json({ 
                success: false, 
                message: "No payment token found for this booking" 
            });
        }

        const genieUrl = `${getGenieBaseUrl()}/public/v2/transactions/${tokenToVerify}`;
        const verifyResponse = await axios.get(genieUrl, {
            headers: {
                "Authorization": process.env.GENIE_API_KEY,
                "Content-Type": "application/json"
            }
        });

        console.log("--- Manual Verification Response from Genie ---", verifyResponse.data);

        // Check if payment is confirmed
        const verifyData = verifyResponse.data || {};
        const innerData = verifyData.data || {};
        const resData = verifyData.response || {};
        
        const stateValues = [
            verifyData.state, verifyData.status, verifyData.transactionStatus, verifyData.paymentStatus,
            innerData.state, innerData.status,
            resData.state, resData.status
        ].map(s => typeof s === 'string' ? s.toUpperCase() : null);

        const isSuccess = stateValues.some(s => s && ["SUCCESS", "CONFIRMED", "COMPLETED", "PAID"].includes(s));

        if (isSuccess) {
            // Update booking to PAID
            booking.paymentStatus = "PAID";
            await booking.save();

            // Send SMS confirmation
            const msg = `Booking Confirmed!\nBus: ${booking.bus.name}\nSeats: ${booking.selectedSeats.join(", ")}\nDate: ${booking.searchData.date}\nRef: ${booking.referenceId}\nThank you!`;
            const passengerPhone = booking.passengerDetails?.phone;
            if (passengerPhone && passengerPhone !== "N/A" && passengerPhone !== "null" && passengerPhone !== "") {
                sendSMS(passengerPhone, msg);
            }

            return res.status(200).json({ 
                success: true, 
                message: "✅ Payment verified and booking confirmed!",
                paymentStatus: "PAID",
                booking
            });
        } else {
            return res.status(200).json({ 
                success: false, 
                message: `Payment not yet confirmed. Current state: ${verifyResponse.data?.state || "UNKNOWN"}`,
                paymentStatus: booking.paymentStatus,
                genieState: verifyResponse.data?.state
            });
        }
    } catch (error) {
        console.error("Verification error:", error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: "Failed to verify payment with Genie",
            error: error.message 
        });
    }
}
