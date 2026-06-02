const getCryptoKey = async (): Promise<CryptoKey> => {
    const keyHex = import.meta.env.VITE_ENCRYPTION_KEY;
    if (!keyHex) {
        throw new Error("VITE_ENCRYPTION_KEY is not defined in environment variables.");
    }
    
    const matches = keyHex.match(/.{1,2}/g);
    if (!matches) {
        throw new Error("Invalid VITE_ENCRYPTION_KEY format. Must be hex string.");
    }
    const keyBytes = new Uint8Array(matches.map((byte: string) => parseInt(byte, 16)));
    
    return window.crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
};

export const encryptPayload = async (plainText: string): Promise<{ encryptedData: string; iv: string; tag: string }> => {
    const key = await getCryptoKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(plainText);
    
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encodedData
    );
    
    const cipherBuffer = new Uint8Array(ciphertext);
    const dataPart = cipherBuffer.slice(0, cipherBuffer.length - 16);
    const tagPart = cipherBuffer.slice(cipherBuffer.length - 16);
    
    const toHex = (buf: Uint8Array) => Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
    
    return {
        encryptedData: toHex(dataPart),
        iv: toHex(iv),
        tag: toHex(tagPart)
    };
};

export const decryptPayload = async (encryptedDataHex: string, ivHex: string, tagHex: string): Promise<string> => {
    const key = await getCryptoKey();
    
    const fromHex = (hex: string) => {
        const matches = hex.match(/.{1,2}/g);
        if (!matches) return new Uint8Array(0);
        return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
    };
    
    const dataBytes = fromHex(encryptedDataHex);
    const ivBytes = fromHex(ivHex);
    const tagBytes = fromHex(tagHex);
    
    const combinedBytes = new Uint8Array(dataBytes.length + tagBytes.length);
    combinedBytes.set(dataBytes);
    combinedBytes.set(tagBytes, dataBytes.length);
    
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: ivBytes,
        },
        key,
        combinedBytes
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
};
