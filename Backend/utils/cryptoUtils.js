import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

// Guard: crash at startup if ENCRYPTION_KEY is not set
if (!process.env.ENCRYPTION_KEY) {
  throw new Error("FATAL: ENCRYPTION_KEY environment variable is not set. Set it in backend/.env");
}

// Convert the hex string encryption key into a Buffer
const getEncryptionKey = () => {
    return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
};

/**
 * Encrypt plain text using AES-256-GCM
 */
export const encrypt = (text) => {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const tag = cipher.getAuthTag().toString("hex");
    
    return {
        encryptedData: encrypted,
        iv: iv.toString("hex"),
        tag: tag
    };
};

/**
 * Decrypt cipher text using AES-256-GCM
 */
export const decrypt = (encryptedData, ivHex, tagHex) => {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
};
