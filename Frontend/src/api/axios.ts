import axios from "axios";

const api = axios.create({
  baseURL: "https://bus-booking-nt91.onrender.com/api",
  withCredentials: true,
  timeout: 10000,
});

export default api;
