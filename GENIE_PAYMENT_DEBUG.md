# Genie Payment 401/500 Error - Debug Guide

## ✅ Fixes Applied

### 1. Frontend Fix (Payment.tsx)
- **Issue**: `fetch()` call was missing `credentials: 'include'`
- **Fix**: Added `credentials: "include"` to send JWT token with request
- **Line**: Payment.tsx:57

### 2. Backend Error Handling
- **Improved**: Better error messages for 401, 403, 400 errors from Genie API
- **Added**: Specific checks for Genie credentials configuration
- **Added**: Early booking existence validation

---

## 🔍 Root Cause Analysis

Your error "**Genie Payment Error: Unauthorized**" is coming from Genie API returning 401.

### Current Configuration (Backend/.env):
```
GENIE_ENV=production
GENIE_MERCHANT_ID=69e8ed9cfac6110002045731
GENIE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GENIE_BASE_URL=https://api.geniebiz.lk
```

---

## 🛠️ Next Steps to Debug

### Step 1: Verify Genie Credentials
Run this test to validate your Genie API credentials:

```bash
cd Backend
node testGenie.js
```

This will test multiple header variations to find which one Genie accepts.

### Step 2: Monitor Backend Logs
When you attempt to pay:
1. Check server logs for "Genie Initiation Request" details
2. Look for the exact error response from Genie API
3. Share the logs that show the complete Genie API response

### Step 3: Check Booking Creation
Before payment, verify:
1. Booking was created successfully (check MongoDB)
2. Booking has a valid `totalAmount`
3. Booking ID matches the one used in payment request

---

## 🎯 Common Issues & Solutions

### Issue: 401 from Genie API
**Causes:**
- ❌ Invalid/expired GENIE_API_KEY
- ❌ Wrong GENIE_ENV (should be 'production' or 'sandbox')
- ❌ Missing or incorrect Authorization header format
- ❌ GENIE_API_KEY not synced with Genie dashboard

**Solution:**
1. Log in to Genie Dashboard
2. Verify API key is still active and not revoked
3. Regenerate API key if necessary
4. Update Backend/.env with new key

---

### Issue: Booking Not Found (404)
**Causes:**
- ❌ Booking creation failed silently
- ❌ BookingId mismatch between frontend and backend
- ❌ MongoDB not accessible

**Solution:**
1. Check MongoDB connection status
2. Verify booking is saved in database
3. Check browser DevTools Network tab - see if booking POST returned success

---

### Issue: Frontend Still Gets 401
**Causes:**
- ❌ JWT token not being sent (even with fix)
- ❌ Token expired
- ❌ CORS not allowing credentials

**Solution:**
```javascript
// Verify in Payment.tsx:
const response = await fetch(`${baseUrl}/genie/pay`, {
  method: "POST",
  credentials: "include", // ✅ Must be present
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({...})
});
```

---

## 📋 Checklist

- [ ] Frontend fix applied (credentials: "include")
- [ ] Backend .env has GENIE_API_KEY set
- [ ] Genie credentials verified in Genie Dashboard
- [ ] MongoDB connection working
- [ ] Server restarted after env changes
- [ ] Test booking creation works
- [ ] Test payment initiation with valid Genie key

---

## 🚀 Testing Payment Flow

### Local Testing:
```bash
cd Backend
npm start

cd Frontend
npm run dev
```

Then:
1. Go to http://localhost:5173
2. Search for a route
3. Select seats
4. Fill passenger details
5. Click "Pay with Genie"
6. Check browser console and server logs
7. Monitor server output for "Genie Initiation Request" and response details

---

## 📞 If Still Not Working

Provide:
1. **Server logs** showing the complete Genie API request and response
2. **Browser DevTools Network tab** screenshot of `/api/genie/pay` request/response
3. **MongoDB check**: Verify booking exists with correct bookingId
4. **Genie Dashboard**: Confirm API key is active and not rate-limited

