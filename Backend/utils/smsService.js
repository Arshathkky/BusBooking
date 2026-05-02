import axios from "axios";

const DIALOG_SMS_URL = "https://esms.dialog.lk/api/v1/sms";

/**
 * Sends an SMS using Dialog ESMS Portal
 * @param {string} phone - Sri Lankan mobile number (e.g., 07XXXXXXXX, 947XXXXXXXX, +947XXXXXXXX)
 * @param {string} message - The message content
 * @returns {Promise<boolean>}
 */
export const sendSMS = async (phone, message) => {
    console.log(`Attempting to send SMS to ${phone}...`);
    try {
        const username = process.env.DIALOG_ESMS_USERNAME;
        const password = process.env.DIALOG_ESMS_PASSWORD;
        const sourceAddress = process.env.DIALOG_ESMS_SOURCE_ADDRESS;

        if (!username || !password) {
            console.error("SMS Error: Dialog ESMS credentials missing in environment variables.");
            return false;
        }

        // Normalize phone number to Dialog format: 947XXXXXXXX
        let normalizedPhone = phone.replace(/\D/g, ""); // Remove non-digits
        if (normalizedPhone.startsWith("07")) {
            normalizedPhone = "94" + normalizedPhone.substring(1);
        } else if (normalizedPhone.startsWith("7")) {
            normalizedPhone = "94" + normalizedPhone;
        } else if (normalizedPhone.startsWith("+94")) {
            normalizedPhone = normalizedPhone.substring(1);
        }

        if (!/^947\d{8}$/.test(normalizedPhone)) {
            console.error(`SMS Error: Invalid Sri Lankan mobile number format: ${phone}`);
            return false;
        }

        // --- 1. LOGIN TO GET TOKEN ---
        const loginRes = await axios.post("https://esms.dialog.lk/api/v2/user/login", {
            username,
            password
        });

        const token = loginRes.data?.token;
        if (!token) {
            console.error("SMS Error: Failed to obtain token from Dialog ESMS. Check credentials.");
            return false;
        }

        console.log("SMS Login Successful! Token obtained.");

        // --- 2. SEND SMS ---
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

        console.log(`SMS API Response for ${normalizedPhone}:`, response.data);

        if (response.status === 200) {
            console.log(`SMS request sent successfully to ${normalizedPhone}`);
            return true;
        } else {
            console.error("SMS Error: Dialog ESMS API responded with status", response.status);
            return false;
        }
    } catch (error) {
        console.error("SMS Error:", error.response?.data || error.message);
        return false;
    }
};
