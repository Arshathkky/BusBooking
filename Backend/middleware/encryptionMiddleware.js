import { encrypt, decrypt } from "../utils/cryptoUtils.js";

export const encryptionMiddleware = (req, res, next) => {
    // Bypass encryption/decryption for third-party webhooks and payment endpoints
    // Genie endpoints need immediate response without encryption overhead
    if (req.path.includes("/genie")) {
        return next();
    }

    // 1. Decrypt Incoming Payload
    if (req.body && req.body.encryptedData && req.body.iv && req.body.tag) {
        try {
            const decryptedString = decrypt(req.body.encryptedData, req.body.iv, req.body.tag);
            req.body = JSON.parse(decryptedString);
        } catch (err) {
            console.error("Payload decryption failed:", err.message);
            return res.status(400).json({ success: false, message: "Invalid encrypted payload" });
        }
    }

    // 2. Encrypt Outgoing JSON Response Payload only for successful responses (2xx)
    const originalSend = res.send;
    res.send = function (body) {
        // Only encrypt JSON responses with successful status codes
        const status = res.statusCode;
        const isSuccess = status >= 200 && status < 300;
        const contentType = res.get("Content-Type");
        if (isSuccess && contentType && contentType.includes("application/json") && body) {
            try {
                let stringBody = typeof body === "string" ? body : JSON.stringify(body);
                // Encrypt payload
                const encryptedPayload = encrypt(stringBody);
                // Set Header to indicate encrypted payload
                res.set("X-Payload-Encrypted", "true");
                // Ensure JSON content type
                res.set("Content-Type", "application/json");
                return originalSend.call(this, JSON.stringify(encryptedPayload));
            } catch (err) {
                console.error("Response encryption failed:", err.message);
            }
        }
        return originalSend.call(this, body);
    };

    next();
};
