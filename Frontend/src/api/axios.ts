import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api",
  withCredentials: true,
  timeout: 10000,
});

export default api;
