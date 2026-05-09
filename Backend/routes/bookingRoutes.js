import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updatePaymentStatus,
  getOccupiedSeatsForDate,
  updateBooking,
  cancelBooking,
  generatePayHereHash,
  payHereNotify,
  getOwnerRecentBookings,
  unblockSeatsAllDays,
  toggleCheckIn
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", createBooking); // Create new booking
router.post("/payhere/hash", generatePayHereHash); // PayHere Hash Generation
router.post("/payhere/notify", payHereNotify); // PayHere Notify Callback
router.get("/occupied-seats", getOccupiedSeatsForDate); // Create new booking
router.get("/", getAllBookings); // Get all bookings
router.get("/:id", getBookingById); // Get one booking
router.put("/:id", updateBooking); // Update booking details
router.put("/:id/payment", updatePaymentStatus); // Update payment status
router.patch("/:id/cancel", cancelBooking); // Cancel booking with remark
router.post("/owner-recent", getOwnerRecentBookings); // Recent bookings for owner/dashboard
router.post("/unblock-all", unblockSeatsAllDays); // Global unblock
router.patch("/:id/check-in", toggleCheckIn); // Toggle check-in status

export default router;
