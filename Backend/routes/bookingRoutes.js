import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getPublicBookingByNumericId,
  getOccupiedSeatsForDate,
  updateBooking,
  cancelBooking,
  getOwnerRecentBookings,
  unblockSeatsAllDays,
  toggleCheckIn,
} from "../controllers/bookingController.js";

// Middleware
import { verifyToken, checkBookingAccess, requireRole, optionalVerifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

<<<<<<< HEAD
router.post("/", createBooking); // Create new booking
router.post("/owner-recent", getOwnerRecentBookings); // Recent bookings for owner/dashboard
router.post("/unblock-all", unblockSeatsAllDays); // Global unblock
router.patch("/:id/check-in", toggleCheckIn); // Toggle check-in status
=======
router.post("/", optionalVerifyToken, createBooking); // Create new booking (public with optional auth)
router.get("/occupied-seats", getOccupiedSeatsForDate); // Get occupied seats (public)
router.get("/public/:bookingId", getPublicBookingByNumericId); // Public verification of single booking by numeric ID

router.get("/", verifyToken, requireRole(["admin", "owner", "conductor"]), getAllBookings); // Get all bookings (admin, owner, conductor)
router.get("/:id", verifyToken, checkBookingAccess, getBookingById); // Get one booking (authenticated owner/admin/customer)
router.put("/:id", verifyToken, checkBookingAccess, updateBooking); // Update booking details (authenticated owner/admin/customer)
// ❌ REMOVED: router.put("/:id/payment", updatePaymentStatus) - Backend webhook is now single source of truth
router.patch("/:id/cancel", verifyToken, checkBookingAccess, cancelBooking); // Cancel booking with remark (authenticated owner/admin/customer)
router.post("/owner-recent", verifyToken, requireRole(["admin", "owner"]), getOwnerRecentBookings); // Recent bookings (owner/admin)
router.post("/unblock-all", verifyToken, requireRole(["admin"]), unblockSeatsAllDays); // Global unblock (admin only)
router.patch("/:id/check-in", verifyToken, requireRole(["admin", "owner", "conductor"]), toggleCheckIn); // Toggle check-in status (admin/owner/conductor)
>>>>>>> 94a2e1eda1be624aa1affbe63ec689cfac45077a

export default router;
