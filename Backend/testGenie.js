import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

const GENIE_BASE_URL = process.env.GENIE_ENV === "production" 
    ? "https://api.geniebiz.lk" 
    : "https://sandbox-api.geniebiz.lk";

const testGenie = async () => {
    const payload = {
        merchant_id: process.env.GENIE_MERCHANT_ID,
        merchantId: process.env.GENIE_MERCHANT_ID,
        amount: "100.00",
        currency: "LKR",
        order_id: "TEST-" + Date.now(),
        orderId: "TEST-" + Date.now(),
        customer_name: "Test User",
        customerName: "Test User",
        customer_email: "test@example.com",
        customerEmail: "test@example.com",
        customer_mobile: "0771234567",
        customerMobile: "0771234567",
        redirect_url: "https://mseat.touchmeplus.com/booking-confirmation",
        redirectUrl: "https://mseat.touchmeplus.com/booking-confirmation",
        callback_url: "https://bus-booking-nt91.onrender.com/api/genie/notify",
        callbackUrl: "https://bus-booking-nt91.onrender.com/api/genie/notify",
    };

    const headerVariations = [
        { "API-Key": process.env.GENIE_API_KEY, "Authorization": `Bearer ${process.env.GENIE_API_SECRET}` },
        { "X-API-Key": process.env.GENIE_API_KEY, "Authorization": `Bearer ${process.env.GENIE_API_SECRET}` },
        { "X-API-Key": process.env.GENIE_API_KEY, "Authorization": process.env.GENIE_API_SECRET },
        { "API-Key": process.env.GENIE_API_KEY, "Authorization": process.env.GENIE_API_SECRET },
        { "api-key": process.env.GENIE_API_KEY, "Authorization": process.env.GENIE_API_SECRET },
        { "apiKey": process.env.GENIE_API_KEY, "Authorization": `Bearer ${process.env.GENIE_API_SECRET}` },
        { "Authorization": `Bearer ${process.env.GENIE_API_KEY}` }, // maybe key is used here?
    ];

    for (let i = 0; i < headerVariations.length; i++) {
        console.log(`\nTesting variation ${i + 1}:`, Object.keys(headerVariations[i]));
        try {
            const response = await axios.post(`${GENIE_BASE_URL}/payment/v2/checkout/initiate`, payload, {
                headers: { ...headerVariations[i], "Content-Type": "application/json" }
            });
            console.log("Success! Data:", response.data);
            return; // Stop if success
        } catch (error) {
            console.log("Failed with status:", error.response?.status);
            if (error.response?.status !== 403 && error.response?.status !== 401) {
                console.log("Error details:", error.response?.data);
                return; // Stop if it's a payload error (400) because auth succeeded
            }
        }
    }
};

testGenie();
