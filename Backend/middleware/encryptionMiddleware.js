import { encrypt, decrypt } from "../utils/cryptoUtils.js";

export const encryptionMiddleware = (req, res, next) => {
    // Bypass encryption/decryption for third-party webhooks (e.g. Genie)
    if (req.path.includes("/genie/notify")) {
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

    // 2. Encrypt Outgoing JSON Response Payload
    const originalSend = res.send;
    res.send = function (body) {
        // Only encrypt JSON responses
        const contentType = res.get("Content-Type");
        if (contentType && contentType.includes("application/json") && body) {
            try {
                // If it's a string, verify if it's JSON
                let stringBody = body;
                if (typeof body !== "string") {
                    stringBody = JSON.stringify(body);
                }

                // Encrypt payload
                const encryptedPayload = encrypt(stringBody);
                
                // Set Header to indicate encrypted payload
                res.set("X-Payload-Encrypted", "true");
                
                // Call original send with encrypted payload JSON
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
