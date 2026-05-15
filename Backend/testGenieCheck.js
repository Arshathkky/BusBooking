import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import axios from 'axios';

const url = 'https://api.geniebiz.lk/payment/v2/checkout/initiate';
const payload = {
  merchantId: process.env.GENIE_MERCHANT_ID,
  amount: '100.00',
  currency: 'LKR',
  orderId: Date.now().toString().slice(0, 10),
  customerName: 'Test User',
  customerEmail: 'test@example.com',
  customerMobile: '94771234567',
  redirectUrl: 'https://example.com/booking-confirmation',
  callbackUrl: 'https://bus-booking-nt91.onrender.com/api/genie/notify',
};

const headers = {
  'API-Key': process.env.GENIE_API_KEY,
  'Authorization': `Bearer ${process.env.GENIE_API_SECRET}`,
  'Content-Type': 'application/json',
};

console.log('GENIE_ENV:', process.env.GENIE_ENV);
console.log('GENIE_BASE_URL:', process.env.GENIE_BASE_URL);
console.log('Request URL:', url);
console.log('Headers:', headers);

(async () => {
  try {
    const response = await axios.post(url, payload, { headers });
    console.log('SUCCESS', response.status, response.data);
  } catch (error) {
    console.error('FAIL', error.response?.status, error.response?.data || error.message);
  }
})();
