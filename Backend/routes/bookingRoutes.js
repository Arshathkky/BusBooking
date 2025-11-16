import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updatePaymentStatus,
  getOccupiedSeatsForDate
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", createBooking); // Create new booking
router.get("/occupied-seats", getOccupiedSeatsForDate); // Create new booking
router.get("/", getAllBookings); // Get all bookings
router.get("/:id", getBookingById); // Get one booking
router.put("/:id/payment", updatePaymentStatus); // Update payment status

export default router;
