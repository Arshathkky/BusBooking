# 🎯 FINAL ACTIONABLE STEPS - Complete Security Implementation

## Current Status
✅ **Core vulnerabilities fixed**
⏳ **Remaining: Apply security middleware to routes & update frontend auth**

---

## STEP 1: Update Owner Routes (CRITICAL) ⚠️

**File**: `Backend/routes/ownerRoutes.js`

Replace entire file with:

```javascript
import express from "express";
import { verifyToken, checkOwnership } from "../middleware/authMiddleware.js";
const router = express.Router();

// Controllers
import * as ownerController from "../controllers/ownerController.js";
import * as overviewController from "../controllers/overviewController.js";

// ✅ Public route - NO auth needed
router.post("/login", ownerController.loginOwner);

// ✅ Protected CRUD operations
router.get("/", verifyToken, ownerController.getOwners); // Admin only
router.get("/:id", verifyToken, checkOwnership("id"), ownerController.getOwnerById);
router.get("/:id/details", verifyToken, checkOwnership("id"), ownerController.getOwnerDetails);
router.get("/:id/overview", verifyToken, checkOwnership("id"), overviewController.getOwnerOverview);
router.post("/", verifyToken, ownerController.addOwner);
router.put("/:id", verifyToken, checkOwnership("id"), ownerController.updateOwner);
router.delete("/:id", verifyToken, checkOwnership("id"), ownerController.deleteOwner);

export default router;
```

---

## STEP 2: Update Booking Routes (CRITICAL) ⚠️

**File**: `Backend/routes/bookingRoutes.js`

Add these imports at the top:
```javascript
import { verifyToken, checkBookingAccess } from "../middleware/authMiddleware.js";
```

Wrap payment-related routes with middleware:
```javascript
// ✅ Protect payment status updates
router.put("/:id/payment", verifyToken, checkBookingAccess, bookingController.updatePaymentStatus);
router.get("/:id", verifyToken, checkBookingAccess, bookingController.getBookingById);
```

---

## STEP 3: Update Frontend to Use JWT Tokens

**File**: `Frontend/src/contexts/AuthContext.tsx`

Find the login function and update it:

```typescript
const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await axios.post(`${API_URL}/owner/login`, {
      email,
      password,
    });

    if (response.data.success && response.data.token) {
      // ✅ Store JWT token
      localStorage.setItem("authToken", response.data.token);
      
      // ✅ Set auth header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      
      const userData: User = {
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role || "owner",
      };
      
      setUser(userData);
      return userData;
    }
    return null;
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
};
```

Add this to useEffect that loads user on mount:
```typescript
useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (token) {
    // ✅ Set auth header from stored token
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}, []);
```

Update logout function:
```typescript
const logout = () => {
  localStorage.removeItem("authToken");
  delete axios.defaults.headers.common["Authorization"];
  setUser(null);
};
```

---

## STEP 4: Remove Unsafe OwnerDashboard URL Params

**File**: `Frontend/src/pages/OwnerDashboard.tsx`

Replace the ownerId fetch logic:
```typescript
// OLD - Vulnerable
const queryOwnerId = searchParams.get("ownerId");
const effectiveOwnerId = user?.role === "admin" ? selectedOwnerId : user?.id;

// NEW - Uses authenticated user context ✅
const effectiveOwnerId = user?.role === "admin" ? selectedOwnerId : user?.id;
// Don't read from URL - only use authenticated user!
```

Update the admin selector:
```typescript
useEffect(() => {
  if (user?.role === "admin") {
    fetchOwners();
    // Set first owner as selected, but DON'T read from URL
    if (owners.length > 0 && !selectedOwnerId) {
      setSelectedOwnerId(owners[0]._id);
    }
  }
}, [user, owners]);
```

---

## STEP 5: Add .env Variables (if not present)

**File**: `Backend/.env`

```env
JWT_SECRET=your-super-secret-key-min-32-chars-long-change-this
JWT_EXPIRE=7d
GENIE_API_KEY=your_genie_api_key
GENIE_ENV=sandbox
BACKEND_URL=http://localhost:5000
```

---

## STEP 6: Test Security Implementations

### Test 1: Authorization Bypass Attempt
```bash
# Try accessing without token
curl http://localhost:5000/api/owner/abc123

# Expected: 401 Unauthorized
# {"success": false, "message": "No authentication token provided"}
```

### Test 2: Wrong Owner Access
```bash
# Login as Owner A, get token
# Try to access Owner B's data with token

curl -H "Authorization: Bearer TOKEN_A" \
  http://localhost:5000/api/owner/OWNER_B_ID

# Expected: 403 Forbidden
# {"success": false, "message": "You do not have permission..."}
```

### Test 3: Payment with Modified Amount
```javascript
// Frontend tries to send different amount
fetch("/api/genie/pay", {
  method: "POST",
  body: JSON.stringify({
    bookingId: "123",
    amount: 100,  // Customer tries to pay 100 instead of 5000
  })
})

// Backend checks: totalAmount = booking.totalAmount (5000)
// So customer cannot manipulate amount ✅
```

### Test 4: URL Parameter Manipulation
```
# Old vulnerable URL (should NOT work now)
https://mseat.touchmeplus.com/owner?ownerId=WRONG_ID

# New secure behavior: Dashboard shows only user's own data
# Admin can only switch between owned entities via dropdown, not URL
```

---

## STEP 7: Verify Payment Flow Works

1. **Customer Books Bus**
   - Frontend: Sends booking request with signed JWT
   - Backend: Validates JWT, calculates price on server
   - Database: Booking created with PENDING status

2. **Customer Initiates Payment**
   - Frontend: Sends secure amount from database
   - Backend: Verifies amount against booking record
   - Genie: Payment initiated with secure amount

3. **Payment Success**
   - Genie: Webhook calls backend with SUCCESS
   - Backend: genieNotify() verifies with Genie API
   - Database: Booking marked PAID

4. **Customer Sees Confirmation**
   - Frontend: Booking confirmation page loads
   - Refetches booking status (should show PAID)
   - Shows ticket details

---

## TROUBLESHOOTING

### Payment still showing 400 error?

**Check these**:
1. Is `GENIE_API_KEY` set correctly in .env?
2. Is Genie environment (sandbox vs production) matching?
3. Check server logs for: `Genie Webhook Verification Response`
4. Verify token is being saved: `booking.paymentToken`

**Debug**: Add this to see what Genie returns:
```javascript
console.log("Genie response:", JSON.stringify(verifyResponse.data, null, 2));
```

---

### Header not showing user info?

1. Clear browser cache
2. Verify JWT token in localStorage: 
   ```javascript
   localStorage.getItem("authToken")
   ```
3. Check if user is being set in AuthContext

---

### Can't access owner dashboard after login?

1. Check if token is being stored: `localStorage.getItem("authToken")`
2. Verify Authorization header is set:
   ```javascript
   console.log(axios.defaults.headers.common["Authorization"])
   ```
3. Check browser console for 401 errors

---

## SECURITY CHECKLIST - Before Going Live

- [ ] JWT_SECRET is strong (>32 chars) and changed from default
- [ ] All owner routes have `verifyToken` middleware
- [ ] All booking routes have `verifyToken` middleware  
- [ ] Frontend stores JWT token in localStorage
- [ ] Frontend includes JWT in Authorization header
- [ ] URL parameters no longer expose sensitive IDs
- [ ] Payment amount verified on server
- [ ] Payment verification logs webhook responses
- [ ] Error messages don't expose internal details
- [ ] Admin can't bypass ownership checks
- [ ] Customers can't access other customers' bookings
- [ ] CORS headers include Authorization

---

## FINAL VERIFICATION

After implementing all steps:

```bash
# 1. Verify middleware installed
grep -r "verifyToken" Backend/routes/

# 2. Verify JWT being issued
# Login as owner and check browser DevTools
# LocalStorage should have: authToken

# 3. Test unauthorized access
curl http://localhost:5000/api/owner/123
# Should return 401

# 4. Test with valid token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/owner/123
# Should return owner data or 403 based on ownership
```

---

## 🎉 After Completion

Your system will be protected against:
- ✅ URL parameter manipulation
- ✅ Payment tampering
- ✅ Unauthorized resource access
- ✅ Session hijacking (with HTTPS)
- ✅ API abuse

**Customers will see**:
- Secure payment confirmation flow
- Clear error messages if payment fails
- No exposed sensitive IDs in URLs

**Admins will see**:
- Audit trails in logs
- Payment verification details
- Authorization failures logged

