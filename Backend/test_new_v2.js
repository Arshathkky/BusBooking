import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import axios from 'axios';

const url = 'https://api.geniebiz.lk/payment/v2/checkout/initiate';
const apiKey = process.env.GENIE_API_KEY;

const payload = {
  order: {
    shopId: process.env.GENIE_MERCHANT_ID,
    items: [
      {
        name: 'Bus Booking',
        quantity: 1,
        unitPrice: 100.00
      }
    ]
  },
  customer: {
    name: 'Test User',
    email: 'test@example.com',
    mobile: '94771234567'
  },
  redirectUrl: 'https://mseat.touchmeplus.com/booking-confirmation',
  callbackUrl: 'https://bus-booking-nt91.onrender.com/api/genie/notify'
};

console.log('Testing NEW Genie V2 API...');
console.log('URL:', url);
console.log('Authorization (Header):', apiKey.substring(0, 20) + '...');

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
