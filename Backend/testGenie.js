import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

const GENIE_BASE_URL = process.env.GENIE_ENV === "production" 
    ? "https://api.genie.lk" 
    : "https://sandbox-api.genie.lk";

const testGenie = async () => {
    try {
        const payload = {
            merchant_id: process.env.GENIE_MERCHANT_ID,
            amount: "100.00",
            currency: "LKR",
            order_id: "TEST-123",
            customer_name: "Test User",
            customer_email: "test@example.com",
            customer_mobile: "0771234567",
            redirect_url: "https://mseat.touchmeplus.com/booking-confirmation",
            callback_url: "https://bus-booking-nt91.onrender.com/api/genie/notify",
        };

        const response = await axios.post(`${GENIE_BASE_URL}/payment/v2/checkout/initiate`, payload, {
            headers: {
                "API-Key": process.env.GENIE_API_KEY,
                "Authorization": `Bearer ${process.env.GENIE_API_SECRET}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Success:", response.data);
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
};

testGenie();
