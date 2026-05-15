import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import axios from 'axios';

const url = 'https://api.geniebusiness.lk/v2/checkout/initiate';
const apiKey = process.env.GENIE_API_KEY;

const payload = {
  amount: 100,
  currency: 'LKR',
  localId: Date.now().toString().slice(0, 10),
  redirectUrl: 'https://mseat.touchmeplus.com/booking-confirmation',
  webhook: 'https://bus-booking-nt91.onrender.com/api/genie/notify',
  tokenize: false,
  paymentType: 'UNSCHEDULED'
};

console.log('Testing NEW GenieBusiness.lk URL...');
console.log('URL:', url);

(async () => {
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
