import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
import axios from "axios";

console.log("GENIE_ENV:", process.env.GENIE_ENV);
const getGenieBaseUrl = () => process.env.GENIE_ENV === "production" 
    ? "https://api.geniebiz.lk" 
    : "https://sandbox-api.geniebiz.lk";
console.log("GENIE_BASE_URL:", getGenieBaseUrl());

const testGenie = async () => {
    // Test payload WITHOUT merchantId (API Key contains it)
    const payload = {
        amount: 10000, // Amount in cents (100 LKR)
        currency: "LKR",
        localId: `TEST-${Date.now()}`,
        redirectUrl: "https://mseat.touchmeplus.com/booking-confirmation",
        webhook: "https://bus-booking-nt91.onrender.com/api/genie/notify",
        metadata: {
            name: "Test User",
            email: "test@example.com"
        }
    };

    const headerVariations = [
        { "Authorization": `Bearer ${process.env.GENIE_API_KEY}`, "Content-Type": "application/json" },
        { "Authorization": `${process.env.GENIE_API_KEY}`, "Content-Type": "application/json" },
        { "X-API-KEY": process.env.GENIE_API_KEY, "Content-Type": "application/json" },
        { "apikey": process.env.GENIE_API_KEY, "Content-Type": "application/json" },
    ];

    for (let i = 0; i < headerVariations.length; i++) {
        console.log(`\n✅ Testing variation ${i + 1}:`, Object.keys(headerVariations[i]));
        try {
            const response = await axios.post(`${getGenieBaseUrl()}/public/v2/transactions`, payload, {
                headers: headerVariations[i]
            });
            console.log("🎉 SUCCESS! Response:", JSON.stringify(response.data, null, 2));
            return;
        } catch (error) {
            console.log("❌ Failed. Status:", error.response?.status || error.code);
            if (error.response?.data) {
                console.log("   Response:", JSON.stringify(error.response.data, null, 2));
            }
        }
    }
};

testGenie();
