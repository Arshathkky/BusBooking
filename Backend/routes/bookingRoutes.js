import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updatePaymentStatus,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", createBooking); // Create new booking
router.get("/", getAllBookings); // Get all bookings
router.get("/:id", getBookingById); // Get one booking
router.put("/:id/payment", updatePaymentStatus); // Update payment status

export default router;
