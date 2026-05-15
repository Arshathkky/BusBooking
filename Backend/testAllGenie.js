import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import axios from 'axios';

const url = 'https://api.geniebiz.lk/payment/v2/checkout/initiate';
const payload = {
  merchantId: process.env.GENIE_MERCHANT_ID,
  amount: '1000.00',
  currency: 'LKR',
  orderId: Date.now().toString().slice(0, 10),
  customerName: 'Test User',
  customerEmail: 'test@example.com',
  customerMobile: '94771234567',
  redirectUrl: 'https://mseat.touchmeplus.com/booking-confirmation',
  callbackUrl: 'https://bus-booking-nt91.onrender.com/api/genie/notify',
  merchant_id: process.env.GENIE_MERCHANT_ID,
  order_id: Date.now().toString().slice(0, 10),
  customer_name: 'Test User',
  customer_email: 'test@example.com',
  customer_mobile: '94771234567',
  redirect_url: 'https://mseat.touchmeplus.com/booking-confirmation',
  callback_url: 'https://bus-booking-nt91.onrender.com/api/genie/notify',
};

const headerVariants = [
  {
    name: "API-Key + secret",
    headers: {
      "API-Key": process.env.GENIE_API_KEY,
      "Authorization": `Bearer ${process.env.GENIE_API_SECRET}`,
      "Content-Type": "application/json"
    }
  },
  {
    name: "X-API-Key + secret",
    headers: {
      "X-API-Key": process.env.GENIE_API_KEY,
      "Authorization": `Bearer ${process.env.GENIE_API_SECRET}`,
      "Content-Type": "application/json"
    }
  },
  {
    name: "API-Key + apiKey bearer",
    headers: {
      "API-Key": process.env.GENIE_API_KEY,
      "Authorization": `Bearer ${process.env.GENIE_API_KEY}`,
      "Content-Type": "application/json"
    }
  },
  {
    name: "X-API-Key + apiKey bearer",
    headers: {
      "X-API-Key": process.env.GENIE_API_KEY,
      "Authorization": `Bearer ${process.env.GENIE_API_KEY}`,
      "Content-Type": "application/json"
    }
  }
];

console.log('Testing Genie API with all header variants...\n');

(async () => {
  for (const variant of headerVariants) {
    try {
      console.log(`\n[Variant] ${variant.name}`);
      console.log('Headers:', JSON.stringify(variant.headers, null, 2));
      const response = await axios.post(url, payload, {
        headers: variant.headers,
        timeout: 5000
      });
      console.log('✅ SUCCESS', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      process.exit(0);
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.log(`❌ FAILED - Status: ${status}`);
      if (data) {
        console.log('Response:', JSON.stringify(data, null, 2));
      } else {
        console.log('Error:', error.message);
      }
    }
  }
  console.log('\n❌ All variants failed!');
})();
