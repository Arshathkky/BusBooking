# ⚠️ GENIE API CREDENTIALS EXPIRED - FIX REQUIRED

## Current Status
✅ Backend properly configured  
✅ V2 API endpoint correct  
❌ **API credentials are INVALID/EXPIRED** (401 Unauthorized)

---

## Fix: Regenerate Genie API Credentials

### Step 1: Log into Genie Dashboard
1. Go to https://dashboard.geniebiz.lk
2. Log in with your credentials
3. Navigate to **API/Integration Settings** or **Developer Console**

### Step 2: Regenerate API Key
1. Find your current API Key (starting with `eyJhbGciOi...`)
2. Look for "Regenerate" or "Create New" button
3. Generate a new API Key
4. Copy the new key

### Step 3: Update Backend/.env
Replace the old key:
```
GENIE_API_KEY=<paste-new-key-here>
```

### Step 4: Test the Connection
```bash
cd Backend
node testGenie.js
```

Expected output:
```
🎉 SUCCESS! Response: {
  "statusCode": 200,
  "data": {
    "id": "...",
    "url": "https://checkout.geniebiz.lk/...",
    ...
  }
}
```

### Step 5: Restart Backend
```bash
npm start
```

---

## Current Credentials (EXPIRED)
```
GENIE_ENV=production
GENIE_MERCHANT_ID=69e8ed9cfac6110002045731
GENIE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (INVALID)
GENIE_API_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (INVALID)
```

---

## If You Need Test/Sandbox Credentials
If you want to test in sandbox mode first:
1. Log into Genie Dashboard
2. Switch to **Sandbox/Test Environment**
3. Get sandbox API credentials
4. Update Backend/.env:
   ```
   GENIE_ENV=sandbox
   GENIE_API_KEY=<sandbox-key>
   ```
5. Test: `node testGenie.js`

---

## Verify Credentials Are Valid
After getting new credentials, run:
```bash
node testGenie.js
```

All 4 tests should eventually show:
- ❌ PP-C-004 (Authorization format issue) → Replace with correct format
- ✅ SUCCESS → Payment gateway is working!

