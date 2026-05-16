import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: path.resolve('Backend/.env') });

const sendSMS = async (phone, message) => {
    console.log(`Attempting to send SMS to ${phone}...`);
    try {
        const username = process.env.DIALOG_ESMS_USERNAME;
        const password = process.env.DIALOG_ESMS_PASSWORD;
        const sourceAddress = process.env.DIALOG_ESMS_SOURCE_ADDRESS || "TouchMePlus";

        if (!username || !password) {
            console.error("SMS Error: Dialog ESMS credentials missing.");
            return false;
        }

        let normalizedPhone = phone.replace(/\D/g, "");
        if (normalizedPhone.startsWith("07")) {
            normalizedPhone = "94" + normalizedPhone.substring(1);
        } else if (normalizedPhone.startsWith("7")) {
            normalizedPhone = "94" + normalizedPhone;
        }

        console.log(`Using credentials: ${username} / ${password.substring(0,3)}...`);

        try {
            const loginRes = await axios.post("https://esms.dialog.lk/api/v2/user/login", {
                username,
                password
            });
            const token = loginRes.data?.token;
            if (!token) throw new Error("No token returned");
            console.log("Token obtained.");

            const response = await axios.post("https://esms.dialog.lk/api/v2/sms", {
                sourceAddress,
                message,
                transaction_id: Date.now().toString(),
                msisdn: [
                    { mobile: normalizedPhone }
                ]
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            console.log("Response:", JSON.stringify(response.data, null, 2));
            return true;
        } catch (err) {
            console.error("Login/Send failed:", err.response?.data || err.message);
            return false;
        }
    } catch (error) {
        console.error("Outer SMS Error:", error.message);
        return false;
    }
};

sendSMS("0777904783", "Test SMS from Bus Booking System at " + new Date().toLocaleTimeString());
