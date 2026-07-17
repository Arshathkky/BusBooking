import axios from "axios";
import { encryptPayload, decryptPayload } from "../utils/cryptoUtils";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api",
  withCredentials: true,
  timeout: 10000,
});

// Request Interceptor (Encrypt Request Payloads & Attach Auth Token)
api.interceptors.request.use(async (config) => {
    // Attach authorization token if present
    const token = localStorage.getItem("token");
    if (token) {
        if (!config.headers) {
            config.headers = {} as any;
        }
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Only encrypt if it's a JSON/Object body
    if (config.data && typeof config.data === "object") {
        try {
            const stringifiedData = JSON.stringify(config.data);
            const encrypted = await encryptPayload(stringifiedData);
            config.data = encrypted;
            
            if (!config.headers) {
                config.headers = {} as any;
            }
            config.headers["Content-Type"] = "application/json";
        } catch (err: any) {
            console.error("Axios request encryption failed:", err.message);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor (Decrypt Response Payloads)
api.interceptors.response.use(async (response) => {
    const isEncrypted = response.headers["x-payload-encrypted"] === "true";
    if (isEncrypted && response.data && response.data.encryptedData) {
        try {
            const decryptedString = await decryptPayload(
                response.data.encryptedData,
                response.data.iv,
                response.data.tag
            );
            response.data = JSON.parse(decryptedString);
        } catch (err: any) {
            console.error("Axios response decryption failed:", err.message);
        }
    }
    return response;
}, (error) => {
    if (
        error.response &&
        error.response.headers["x-payload-encrypted"] === "true" &&
        error.response.data &&
        error.response.data.encryptedData
    ) {
        return decryptPayload(
            error.response.data.encryptedData,
            error.response.data.iv,
            error.response.data.tag
        ).then((decryptedString) => {
            error.response.data = JSON.parse(decryptedString);
            return Promise.reject(error);
        }).catch(() => {
            return Promise.reject(error);
        });
    }
    return Promise.reject(error);
});

export default api;
