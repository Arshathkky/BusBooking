import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

// Convert the hex string encryption key into a Buffer
const getEncryptionKey = () => {
    const key = process.env.ENCRYPTION_KEY || "d6f83f21820b411982b68c92a6c1e31d8e137c8e92f15b6cd987e6a71e82a39a";
    return Buffer.from(key, "hex");
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
