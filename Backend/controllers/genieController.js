import axios from "axios";
import Booking from "../models/bookingModel.js";
import Bus from "../models/busModel.js";
import { sendSMS } from "../utils/smsService.js";

const sanitizeUrl = (url) => url?.toString().trim().replace(/\/+$/, "");
const getGenieBaseUrl = () => {
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
        const { bookingId, amount, customerDetails, selectedSeats } = req.body;

        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required" });
        }

        const booking = await Booking.findOne({ bookingId });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (!amount || isNaN(Number(amount))) {
            return res.status(400).json({ success: false, message: "Invalid amount provided" });
        }

        // Format phone number to 94XXXXXXXXX format
        let formattedPhone = customerDetails?.phone ? customerDetails.phone.replace(/\D/g, "") : "";
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "94" + formattedPhone.substring(1);
        } else if (formattedPhone.length === 9) {
            formattedPhone = "94" + formattedPhone;
        }

        const payload = {
            amount: Math.round(Number(amount) * 100), // Genie expects amount in cents (integer)
            currency: "LKR",
            localId: `B${bookingId}-${Date.now().toString().slice(-6)}`, // Shorter and unique
            redirectUrl: `${req.headers.origin || "https://mseat.touchmeplus.com"}/booking-confirmation`,
            webhook: `${process.env.BACKEND_URL || "https://bus-booking-nt91.onrender.com"}/api/genie/notify`,
            metadata: {
                customerName: customerDetails?.name || "Guest",
                customerEmail: customerDetails?.email || "passenger@example.com",
                customerPhone: formattedPhone
            }
        };

        // If direct card is requested, restrict providers to 'card'
        if (req.body.paymentMethod === "card") {
            payload.providerRestrictions = ["card"];
        }

        const genieUrl = `${getGenieBaseUrl()}/public/v2/transactions`;

        console.log("--- Genie Initiation Request (V2 - Final) ---");
        console.log("URL:", genieUrl);
        console.log("Payload:", JSON.stringify(payload, null, 2));

        const response = await axios.post(genieUrl, payload, {
            headers: {
                "Authorization": process.env.GENIE_API_KEY,
                "Content-Type": "application/json"
            }
        });

        console.log("--- Genie Initiation Response ---");
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(response.data, null, 2));

        if (response.data && (response.data.url || response.data.paymentUrl)) {
            const paymentUrl = response.data.url || response.data.paymentUrl;
            res.status(200).json({ 
                success: true, 
                payment_url: paymentUrl,
                token: response.data.token || response.data.id 
            });
        } else {
            throw new Error(response.data.message || "Failed to get payment URL from Genie");
        }
    } catch (error) {
        console.error("Genie Initiation Error Details:", error.response?.data || error.message);
        
        const genieErrorData = error.response?.data;
        const genieErrorMessage = genieErrorData?.message || genieErrorData?.error || error.message || "Failed to initiate Genie payment";
        const genieExtraInfo = genieErrorData?.extraInfo ? JSON.stringify(genieErrorData.extraInfo) : "";
        
        res.status(500).json({ 
            success: false, 
            message: `Genie Payment Error: ${genieErrorMessage}`,
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

        const { order_id, status, signature } = req.body;
        
        // TODO: Verify signature from Genie to ensure authenticity
        
        // Handle order_id if it's passed as a string or contains extra info (e.g., bookingId-timestamp)
        const cleanOrderId = order_id.toString().split("-")[0];
        const booking = await Booking.findOne({ bookingId: Number(cleanOrderId) });
        if (!booking) {
            return res.status(404).send("Booking not found");
        }

        if (status === "SUCCESS") {
            booking.paymentStatus = "PAID";
            await booking.save();

            // Send SMS
            if (booking.passengerDetails?.phone) {
                const msg = `Booking Confirmed!\nBus: ${booking.bus.name}\nSeats: ${booking.selectedSeats.join(", ")}\nDate: ${booking.searchData.date}\nRef: ${booking.referenceId}\nThank you!`;
                sendSMS(booking.passengerDetails.phone, msg);

                // ✅ Also notify owner if enabled
                try {
                    const bus = await Bus.findById(booking.bus.id);
                    if (bus && bus.notifyOwnerOnBooking && bus.ownerPhoneForSMS) {
                        const ownerMsg = `[OWNER COPY] ${msg}`;
                        sendSMS(bus.ownerPhoneForSMS, ownerMsg);
                    }
                } catch (err) {
                    console.error("Owner SMS failed:", err);
                }
            }
            
            console.log(`✅ Genie Payment Success for Order: ${order_id}`);
        } else {
            booking.paymentStatus = "CANCELLED";
            await booking.save();
            console.log(`❌ Genie Payment Failed/Cancelled for Order: ${order_id}`);
        }

        res.status(200).send("OK");
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
