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

        const booking = await Booking.findOne({ bookingId });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Format phone number to 94XXXXXXXXX format
        let formattedPhone = customerDetails.phone.replace(/\D/g, "");
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "94" + formattedPhone.substring(1);
        } else if (formattedPhone.length === 9) {
            formattedPhone = "94" + formattedPhone;
        }

        const payload = {
            amount: parseFloat(amount),
            currency: "LKR",
            localId: bookingId.toString(),
            redirectUrl: `${req.headers.origin || "https://mseat.touchmeplus.com"}/booking-confirmation`,
            webhook: `${process.env.BACKEND_URL || "https://bus-booking-nt91.onrender.com"}/api/genie/notify`,
            tokenize: false,
            paymentType: "UNSCHEDULED",
            customer: {
                name: customerDetails.name,
                email: customerDetails.email || "passenger@example.com",
                billingEmail: customerDetails.email || "passenger@example.com",
                billingAddress1: "Not provided",
                billingCity: "Colombo",
                billingCountry: "LK",
                billingPostCode: "00100"
            }
        };

        const genieUrl = "https://api.geniebusiness.lk/v2/checkout/initiate";

        console.log("--- Genie Initiation Request (V2 - Business) ---");
        console.log("URL:", genieUrl);
        console.log("Payload:", JSON.stringify(payload, null, 2));

        const response = await axios.post(genieUrl, payload, {
            headers: {
                "Authorization": `Bearer ${process.env.GENIE_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        console.log("--- Genie Initiation Response ---");
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(response.data, null, 2));

        if (response.data && response.data.paymentUrl) {
            res.status(200).json({ 
                success: true, 
                payment_url: response.data.paymentUrl,
                token: response.data.token 
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
        const { order_id, status, signature } = req.body;
        
        // TODO: Verify signature from Genie to ensure authenticity
        
        const booking = await Booking.findOne({ bookingId: order_id });
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
