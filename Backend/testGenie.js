import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("Backend/.env") });
import axios from "axios";

console.log("GENIE_ENV:", process.env.GENIE_ENV);
const GENIE_BASE_URL = process.env.GENIE_ENV === "production" 
    ? "https://api.geniebiz.lk" 
    : "https://sandbox-api.geniebiz.lk";
console.log("GENIE_BASE_URL:", GENIE_BASE_URL);

const testGenie = async () => {
    const payload = {
        merchantId: process.env.GENIE_MERCHANT_ID,
        amount: "100.00",
        currency: "LKR",
        orderId: Date.now().toString().substring(0, 10),
        customerName: "Test User",
        customerEmail: "test@example.com",
        customerMobile: "94771234567",
        redirectUrl: "https://mseat.touchmeplus.com/booking-confirmation",
        callbackUrl: "https://bus-booking-nt91.onrender.com/api/genie/notify",
    };

    const headerVariations = [
        { "API-Key": process.env.GENIE_API_KEY, "Authorization": `Bearer ${process.env.GENIE_API_SECRET}` },
        { "X-API-Key": process.env.GENIE_API_KEY, "Authorization": `Bearer ${process.env.GENIE_API_SECRET}` },
        { "X-API-Key": process.env.GENIE_API_KEY, "Authorization": process.env.GENIE_API_SECRET },
        { "API-Key": process.env.GENIE_API_KEY, "Authorization": process.env.GENIE_API_SECRET },
        { "api-key": process.env.GENIE_API_KEY, "Authorization": process.env.GENIE_API_SECRET },
        { "apiKey": process.env.GENIE_API_KEY, "Authorization": `Bearer ${process.env.GENIE_API_SECRET}` },
        { "Authorization": `Bearer ${process.env.GENIE_API_KEY}` },
        { "Authorization": `Bearer ${process.env.GENIE_API_SECRET}`, "API-Key": process.env.GENIE_API_KEY },
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
            console.log("Failed. Message:", error.message);
            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);
            } else {
                console.log("No response received. Error code:", error.code);
            }
        }
    }
};

testGenie();
