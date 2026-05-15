import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import axios from 'axios';

const url = 'https://api.geniebiz.lk/payment/v2/checkout/initiate';
const apiKey = process.env.GENIE_API_KEY;

const payload = {
  merchantId: process.env.GENIE_MERCHANT_ID,
  amount: '100.00',
  currency: 'LKR',
  orderId: Date.now().toString().slice(0, 10),
  customerName: 'Test User',
  customerEmail: 'test@example.com',
  customerMobile: '94771234567',
  redirectUrl: 'https://mseat.touchmeplus.com/booking-confirmation',
  callbackUrl: 'https://bus-booking-nt91.onrender.com/api/genie/notify',
};

console.log('Testing OLD Genie URL with NEW header (no Bearer)...');
console.log('URL:', url);

(async () => {
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ SUCCESS', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ FAILED');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
})();
