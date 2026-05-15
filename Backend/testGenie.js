import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

const GENIE_BASE_URL = process.env.GENIE_ENV === "production" 
    ? "https://api.geniebiz.lk" 
    : "https://sandbox-api.geniebiz.lk";

const testGenie = async () => {
    try {
        const payload = {
            merchantId: process.env.GENIE_MERCHANT_ID,
            amount: "100.00",
            currency: "LKR",
            orderId: "TEST-" + Date.now(),
            customerName: "Test User",
            customerEmail: "test@example.com",
            customerMobile: "0771234567",
            redirectUrl: "https://mseat.touchmeplus.com/booking-confirmation",
            callbackUrl: "https://bus-booking-nt91.onrender.com/api/genie/notify",
        };

        console.log("Testing with camelCase and Authorization Header...");
        const response = await axios.post(`${GENIE_BASE_URL}/payment/v2/checkout/initiate`, payload, {
            headers: {
                "api-key": process.env.GENIE_API_KEY,
                "Authorization": `Bearer ${process.env.GENIE_API_SECRET}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Success:", response.data);
    } catch (error) {
        console.error("Error Response:", error.response?.data || error.message);
        console.error("Status:", error.response?.status);
    }
};

testGenie();
