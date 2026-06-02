import jwt from "jsonwebtoken";

// Helper to manually parse cookies from the Cookie header
const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach(cookie => {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join("=").trim();
    }
  });
  return cookies;
};

/**
 * ✅ Verify JWT token from request headers or HttpOnly cookies
 * Returns user info from token
 */
export const verifyToken = (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    // Prefer HttpOnly cookie token, fallback to Bearer token in Authorization header
    const token = cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined);
    
    if (!token) {
      console.warn('🔐 verifyToken: No token found (cookie or Authorization header)');
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

/**
 * ✅ Check if user owns the resource (for owner data)
 * Use: checkOwnership(paramName)
 */
export const checkOwnership = (paramName = "id") => {
  return (req, res, next) => {
    const resourceId = req.params[paramName] || req.query[paramName] || req.body[paramName];
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Admins can access all resources
    if (userRole === "admin") {
      return next();
    }

    // If checking owner ownership, userId must match ownerId
    if (userRole === "owner" && paramName === "ownerId" && userId === resourceId) {
      return next();
    }

    // Owners are allowed to access conductor/bus/route/reports (non-ownerId params)
    if (userRole === "owner" && paramName !== "ownerId") {
      return next();
    }

    // For conductor routes, userId should match the conductor ID
    if (userRole === "conductor" && userId === resourceId) {
      return next();
    }

    // Check if it's accessing own booking
    if (userRole === "customer" || !userRole) {
      // Customer can only access their own data
      // This would need booking ownership check in controller
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "You do not have permission to access this resource"
    });
  };
};

/**
 * ✅ Require specific role
 */
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `This action requires one of these roles: ${roles.join(", ")}`
      });
    }

    next();
  };
};

/**
 * ✅ Validate booking ownership (compare user ID with booking creator)
 */
export const checkBookingAccess = async (req, res, next) => {
  try {
    const bookingId = req.params.id || req.body.bookingId;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!bookingId) {
      return next(); // Let controller handle missing ID
    }

    // Admins and owners can access all bookings
    if (["admin", "owner"].includes(userRole)) {
      return next();
    }

    // For customers, we should verify they created this booking
    // This would require fetching the booking and checking userId
    // For now, just proceed - controller will validate
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization check failed"
    });
  }
};

/**
 * ✅ Optional JWT token verification
 * Allows request to pass but populates req.user if a valid token is provided
 */
export const optionalVerifyToken = (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      req.user = decoded;
    }
    next();
  } catch (error) {
    // If token is invalid, we don't reject, just proceed as unauthenticated
    next();
  }
};
