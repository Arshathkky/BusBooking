import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
dotenv.config({ path: path.resolve('Backend/.env') });

const getGenieBaseUrl = () => {
    return process.env.GENIE_ENV === "production"
        ? "https://api.geniebiz.lk"
        : "https://sandbox-api.geniebiz.lk";
};

const testLogic = async () => {
    const payload = {
        amount: 10000,
        currency: "LKR",
        localId: `T${Date.now().toString().slice(-10)}`,
        redirectUrl: "https://mseat.touchmeplus.com/booking-confirmation",
        webhook: "https://bus-booking-nt91.onrender.com/api/genie/notify",
        metadata: {
            customerName: "Test User",
            customerEmail: "passenger@example.com"
        }
    };

    const genieUrl = `${getGenieBaseUrl()}/public/v2/transactions`;

    console.log("URL:", genieUrl);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("API Key exists:", !!process.env.GENIE_API_KEY);

    try {
        const response = await axios.post(genieUrl, payload, {
            headers: {
                "Authorization": process.env.GENIE_API_KEY,
                "Content-Type": "application/json"
            }
        });

        console.log("SUCCESS");
        console.log("Data:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log("FAILED");
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log("Error:", error.message);
        }
    }
};

testLogic();
