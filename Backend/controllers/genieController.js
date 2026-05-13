import axios from "axios";
import Booking from "../models/bookingModel.js";
import { sendSMS } from "../utils/smsService.js";

const GENIE_BASE_URL = process.env.GENIE_ENV === "production" 
    ? "https://api.genie.lk" 
    : "https://sandbox-api.genie.lk";

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
            merchant_id: process.env.GENIE_MERCHANT_ID,
            amount: parseFloat(amount).toFixed(2),
            currency: "LKR",
            order_id: bookingId.toString(),
            customer_name: customerDetails.name,
            customer_email: customerDetails.email || "passenger@example.com",
            customer_mobile: customerDetails.phone,
            redirect_url: `${req.headers.origin}/booking-confirmation`,
            callback_url: `${process.env.BACKEND_URL || "https://bus-booking-nt91.onrender.com"}/api/genie/notify`,
        };

        // Note: Real Genie integration usually requires a signature or token.
        // We'll use the API Key in headers as a placeholder for now.
        const response = await axios.post(`${GENIE_BASE_URL}/payment/v2/checkout/initiate`, payload, {
            headers: {
                "API-Key": process.env.GENIE_API_KEY,
                "Authorization": `Bearer ${process.env.GENIE_API_SECRET}`, // Placeholder for JWT
                "Content-Type": "application/json"
            }
        });

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
        res.status(500).json({ 
            success: false, 
            message: "Failed to initiate Genie payment",
            error: error.response?.data || error.message 
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
