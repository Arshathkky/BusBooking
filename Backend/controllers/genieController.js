import axios from "axios";
import Booking from "../models/bookingModel.js";
import Bus from "../models/busModel.js";
import { sendSMS } from "../utils/smsService.js";

const GENIE_BASE_URL = process.env.GENIE_ENV === "production" 
    ? "https://api.geniebiz.lk" 
    : "https://sandbox-api.geniebiz.lk";

/**
 * Initiate Genie Payment
 */
export const initiateGeniePayment = async (req, res) => {
    try {
        const { bookingId, amount, customerDetails } = req.body;

        const booking = await Booking.findOne({ bookingId });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const payload = {
            // snake_case
            merchant_id: process.env.GENIE_MERCHANT_ID,
            amount: parseFloat(amount).toFixed(2),
            currency: "LKR",
            order_id: bookingId.toString(),
            customer_name: customerDetails.name,
            customer_email: customerDetails.email || "passenger@example.com",
            customer_mobile: customerDetails.phone,
            redirect_url: `${req.headers.origin || "https://mseat.touchmeplus.com"}/booking-confirmation`,
            callback_url: `${process.env.BACKEND_URL || "https://bus-booking-nt91.onrender.com"}/api/genie/notify`,
            
            // camelCase (adding for compatibility with different Genie API versions)
            merchantId: process.env.GENIE_MERCHANT_ID,
            orderId: bookingId.toString(),
            customerName: customerDetails.name,
            customerEmail: customerDetails.email || "passenger@example.com",
            customerMobile: customerDetails.phone,
            redirectUrl: `${req.headers.origin || "https://mseat.touchmeplus.com"}/booking-confirmation`,
            callbackUrl: `${process.env.BACKEND_URL || "https://bus-booking-nt91.onrender.com"}/api/genie/notify`,
        };

        console.log("--- Genie Initiation Request ---");
        console.log("URL:", `${GENIE_BASE_URL}/payment/v2/checkout/initiate`);
        console.log("Payload:", JSON.stringify(payload, null, 2));
        console.log("Headers (Partial):", { "API-Key": process.env.GENIE_API_KEY ? "EXISTS" : "MISSING" });

        const response = await axios.post(`${GENIE_BASE_URL}/payment/v2/checkout/initiate`, payload, {
            headers: {
                "API-Key": process.env.GENIE_API_KEY,
                "Authorization": `Bearer ${process.env.GENIE_API_SECRET}`,
                "Content-Type": "application/json"
            }
        });

        console.log("--- Genie Initiation Response ---");
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(response.data, null, 2));

        if (response.data && response.data.payment_url) {
            res.status(200).json({ 
                success: true, 
                payment_url: response.data.payment_url,
                token: response.data.token 
            });
        } else {
            throw new Error(response.data.message || "Failed to get payment URL from Genie");
        }
    } catch (error) {
        console.error("Genie Initiation Error:", error.response?.data || error.message);
        
        // Detailed error for debugging
        const genieErrorData = error.response?.data;
        const genieErrorMessage = genieErrorData?.message || genieErrorData?.error || error.message || "Failed to initiate Genie payment";
        
        res.status(500).json({ 
            success: false, 
            message: `Genie Payment Error: ${genieErrorMessage}`,
            details: genieErrorData,
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
