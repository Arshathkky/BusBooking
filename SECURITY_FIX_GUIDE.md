# 🔒 Security Fix Guide - Critical Issues

## Issues Identified:

### 1. **URL Parameter Exposure (CRITICAL - Severity: HIGH)**
**Current Problem:**
```
https://mseat.touchmeplus.com/owner?ownerId=6a09ae0034a50d0de137e69e
https://mseat.touchmeplus.com/booking-confirmation?order_id=593
```
- Anyone can change `ownerId` or `order_id` in URL
- No validation if user owns that resource
- Direct exposure of database IDs

**Solution:**
1. Use JWT/Authentication to store user context
2. Fetch user ID from authenticated session (not URL)
3. Backend validates user has permission to access resource
4. Use POST requests for sensitive operations

---

### 2. **Payment Amount Tampering (CRITICAL - Severity: HIGH)**
**Current Problem:**
- Frontend sends `totalAmount` to backend
- Customer could modify before sending

**GOOD NEWS:** Your backend ALREADY has protection:
```javascript
// genieController.js - Line 24
const secureAmount = booking.totalAmount;  // ✅ Uses DB value, not request param
```

**Additional Protection Needed:**
- Validate customer can't modify seats mid-payment
- Double-check amount calculation

---

### 3. **Payment 400 Error After Confirmation**
**Problem:**
```
Payment verification failed: Transaction not successful on Genie gateway.
```

**Cause:** 
- Genie API verification logic checking wrong field
- Token verification failing

**Solution:**
- Fix verification logic in BookingConfirmation page
- Better error logging

---

## Implementation Plan:

### **STEP 1: Hide URLs from Header**
- Remove navigation links that expose IDs
- Use internal state instead of URL params
- Only show if user is authenticated

### **STEP 2: Backend - Add Auth Middleware**
- Create middleware to check JWT token
- Verify user owns the resource (ownerId, bookingId)
- Return 403 Forbidden if unauthorized

### **STEP 3: Frontend - Use SessionStorage**
- Store user context in secure session
- Fetch user ID from session, not URL
- Validate before navigation

### **STEP 4: Payment - Strengthen Validation**
- Backend recalculates amount based on DB prices
- No client-side amount modification allowed
- Log all payment attempts

---

## Files to Modify:

### Backend:
1. `routes/ownerRoutes.js` - Add auth middleware
2. `routes/bookingRoutes.js` - Add auth middleware
3. `controllers/bookingController.js` - Fix payment verification
4. `controllers/genieController.js` - Improve error handling

### Frontend:
1. `components/Header.tsx` - Hide insecure links
2. `pages/OwnerDashboard.tsx` - Use session context
3. `pages/BookingConfirmation.tsx` - Fix payment verification
4. `contexts/AuthContext.tsx` - Add session validation

---

## Quick Wins (Implement First):

1. **Remove owner link from header** ✓
2. **Use searchParams with validation** ✓
3. **Add backend authorization checks** ✓
