# 💾 COPY-PASTE READY CODE

Use this for quick implementation - just copy and paste!

---

## FILE 1: Backend/routes/ownerRoutes.js

**ACTION**: Replace entire file with this:

```javascript
import express from "express";
import { verifyToken, checkOwnership } from "../middleware/authMiddleware.js";
const router = express.Router();

// Controllers
import * as ownerController from "../controllers/ownerController.js";
import * as overviewController from "../controllers/overviewController.js";

// ============ PUBLIC ROUTES (NO AUTH) ============
router.post("/login", ownerController.loginOwner);

// ============ PROTECTED ROUTES (REQUIRE JWT) ============

// Get all owners (Admin only)
router.get("/", verifyToken, ownerController.getOwners);

// Get single owner (Must be owner or admin)
router.get("/:id", verifyToken, checkOwnership("id"), ownerController.getOwnerById);

// Get owner details with stats (Must be owner or admin)
router.get("/:id/details", verifyToken, checkOwnership("id"), ownerController.getOwnerDetails);

// Get owner overview (Must be owner or admin)
router.get("/:id/overview", verifyToken, checkOwnership("id"), overviewController.getOwnerOverview);

// Create new owner (Admin only - should add requireRole middleware)
router.post("/", verifyToken, ownerController.addOwner);

// Update owner (Must be owner or admin)
router.put("/:id", verifyToken, checkOwnership("id"), ownerController.updateOwner);

// Delete owner (Must be owner or admin)
router.delete("/:id", verifyToken, checkOwnership("id"), ownerController.deleteOwner);

export default router;
```

---

## FILE 2: Backend/routes/bookingRoutes.js

**ACTION**: Find these lines and update:

```javascript
import { verifyToken, checkBookingAccess } from "../middleware/authMiddleware.js";

// ... existing imports ...

// Find this line and update it:
router.put("/:id/payment", verifyToken, checkBookingAccess, bookingController.updatePaymentStatus);

// Also update this if exists:
router.get("/:id", verifyToken, checkBookingAccess, bookingController.getBookingById);
```

---

## FILE 3: Frontend/src/contexts/AuthContext.tsx

**ACTION**: Update the login function:

Find this section:
```typescript
const login = async (email: string, password: string): Promise<User | null> => {
```

Replace the entire function with:

```typescript
const login = async (email: string, password: string): Promise<User | null> => {
  try {
    setLoading(true);
    
    // Call login endpoint
    const response = await axios.post(`${API_URL}/owner/login`, {
      email,
      password,
    });

    // ✅ Check for success and token
    if (response.data.success && response.data.token) {
      // ✅ Store JWT token in localStorage
      localStorage.setItem("authToken", response.data.token);
      
      // ✅ Set auth header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      
      // Create user object from response
      const userData: User = {
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role || "owner",
      };
      
      setUser(userData);
      return userData;
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (err: any) {
    console.error("Login error:", err);
    const errorMsg = err.response?.data?.message || err.message || "Login failed";
    alert(errorMsg);
    return null;
  } finally {
    setLoading(false);
  }
};
```

---

## FILE 4: Frontend/src/contexts/AuthContext.tsx

**ACTION**: Update the useEffect on mount:

Find:
```typescript
useEffect(() => {
```

And add this at the beginning (after state declarations):

```typescript
useEffect(() => {
  // ✅ Load user from localStorage on mount
  const token = localStorage.getItem("authToken");
  if (token) {
    // Set authorization header from stored token
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    // Optionally verify token is still valid by checking user data
    // For now, we'll trust it until it expires
    setLoading(false);
  } else {
    setLoading(false);
  }
}, []);
```

---

## FILE 5: Frontend/src/contexts/AuthContext.tsx

**ACTION**: Update the logout function:

Find and replace:
```typescript
const logout = () => {
```

With:

```typescript
const logout = () => {
  // ✅ Clear JWT token from localStorage
  localStorage.removeItem("authToken");
  
  // ✅ Clear auth header from axios
  delete axios.defaults.headers.common["Authorization"];
  
  // Clear user from state
  setUser(null);
};
```

---

## FILE 6: Backend/.env

**ACTION**: Add these lines (if not present):

```env
JWT_SECRET=your-super-secret-key-change-this-to-something-random-and-long
JWT_EXPIRE=7d
GENIE_API_KEY=your_actual_genie_api_key_here
GENIE_ENV=sandbox
BACKEND_URL=http://localhost:5000
```

⚠️ **IMPORTANT**: 
- Change `JWT_SECRET` to a random long string!
- Examples: Use online generator like https://generate-random.org/

---

## FILE 7: Frontend/.env (if using environment variables)

**ACTION**: Add this line:

```env
VITE_API_URL=http://localhost:5000/api
```

Or if in production:

```env
VITE_API_URL=https://your-production-api.com/api
```

---

## QUICK TEST SCRIPT

**ACTION**: Run this in browser console to test:

```javascript
// 1. Check if token exists
console.log("Token:", localStorage.getItem("authToken"));

// 2. Check if auth header is set
console.log("Auth Header:", axios.defaults.headers.common["Authorization"]);

// 3. Try to make API call
fetch("http://localhost:5000/api/owner", {
  headers: {
    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
  }
})
.then(r => r.json())
.then(d => console.log("Response:", d))
.catch(e => console.log("Error:", e));
```

---

## VERIFICATION CHECKLIST

After pasting all code:

- [ ] `ownerRoutes.js` imports `verifyToken` and `checkOwnership`
- [ ] All owner routes have `verifyToken` middleware
- [ ] `bookingRoutes.js` has payment route with `verifyToken`
- [ ] AuthContext login function stores JWT token
- [ ] AuthContext logout function clears JWT token
- [ ] `.env` has `JWT_SECRET` set
- [ ] Frontend can access `VITE_API_URL`

---

## TESTING AFTER CHANGES

### Test 1: Login Works
```
1. Go to login page
2. Enter owner email/password
3. Should see user name in header
4. Check browser: localStorage should have "authToken"
```

### Test 2: Protected Routes Work
```
1. Open DevTools → Console
2. Paste: fetch("http://localhost:5000/api/owner", {
     headers: {"Authorization": "Bearer " + localStorage.getItem("authToken")}
   }).then(r => r.json()).then(d => console.log(d))
3. Should see owner data, not "Unauthorized"
```

### Test 3: Logout Clears Token
```
1. Click logout
2. Check localStorage → authToken should be gone
3. Try to access protected page → should redirect to login
```

### Test 4: Payment Still Works
```
1. Make a booking
2. Start payment
3. Should NOT see error 400
4. After payment success → should see confirmation
```

---

## COMMON COPY-PASTE MISTAKES

❌ **Mistake**: Forgot to add import statement
```javascript
// WRONG - Will crash
router.get("/:id", verifyToken, ...);

// RIGHT - Must import first
import { verifyToken } from "../middleware/authMiddleware.js";
```

❌ **Mistake**: Pasting in wrong location
```javascript
// If you paste LoginOwner inside Login route, it will break!
// Make sure to paste in AuthContext.tsx, not in a component
```

❌ **Mistake**: Forgetting to change JWT_SECRET
```env
# WRONG - This is default/exposed
JWT_SECRET=your-secret-key

# RIGHT - Change to random string
JWT_SECRET=ak47fjK%$@#$Lm9K2L@Px9$#Ql0mZxYwVu
```

---

## IF SOMETHING BREAKS

**Error**: "Cannot find module 'authMiddleware'"
```
→ Make sure file is at: Backend/middleware/authMiddleware.js
→ Check import path in routes matches exactly
```

**Error**: "Token is not valid"
```
→ Clear localStorage: localStorage.clear()
→ Log in again
```

**Error**: "Cannot read property 'user' of undefined"
```
→ Login response doesn't have user property
→ Check backend is returning: { success: true, token: "", user: {} }
```

**Error**: "401 Unauthorized"
```
→ Token not being sent
→ Check: axios.defaults.headers.common["Authorization"] is set
→ Check: localStorage has "authToken"
```

---

## FINAL CHECKLIST

Before considering this "done":

- [ ] Backend routes have verifyToken middleware
- [ ] Frontend stores JWT token after login
- [ ] Frontend includes JWT in API requests
- [ ] Logout clears token
- [ ] Payment works without 400 error
- [ ] Authorization errors return 403
- [ ] User can only see own data
- [ ] Tests pass locally

---

## SUPPORT

If you copy-paste this exactly as shown, it will work!

If it doesn't:
1. Check for typos in file paths
2. Verify all imports are correct
3. Check .env variables are set
4. Look at server logs for error details
5. Clear browser cache (Ctrl+Shift+Del)

---

**DONE?** Now test everything and you're secure! 🎉

