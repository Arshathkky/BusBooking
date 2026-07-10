import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updatePaymentStatus,
  getOccupiedSeatsForDate,
  updateBooking,
  cancelBooking,
  getOwnerRecentBookings,
  unblockSeatsAllDays,
  toggleCheckIn,
} from "../controllers/bookingController.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/", createBooking); // Create new booking
router.post("/owner-recent", getOwnerRecentBookings); // Recent bookings for owner/dashboard
router.post("/unblock-all", unblockSeatsAllDays); // Global unblock
router.patch("/:id/check-in", toggleCheckIn); // Toggle check-in status

export default router;
