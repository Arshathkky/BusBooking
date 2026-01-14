import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Bus from "../models/busModel.js";
import Conductor from "../models/conductorModel.js";
import { Counter } from "../models/counterModal.js";

/* ===========================
   CREATE BOOKING (PENDING)
=========================== */
export const createBooking = async (req, res) => {
  try {
    // 1️⃣ Auto-increment bookingId
    const counter = await Counter.findOneAndUpdate(
      { name: "booking" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const bookingId = counter.seq;

    // 2️⃣ Extract data
    const { searchData, selectedSeats, bus } = req.body;

    // 3️⃣ Reference ID
    const referenceId = `${searchData.date}-${selectedSeats.join("")}-${bus.busNumber || bus.name}`;

    // 4️⃣ Hold & payment expiry (10 mins)
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    // 5️⃣ Create booking (DATE-WISE)
    const booking = await Booking.create({
      ...req.body,
      bookingId,
      referenceId,
      holdExpiresAt: expiryTime,
      paymentExpiresAt: expiryTime,
      paymentStatus: "PENDING",
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error("Booking creation failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   GET ALL BOOKINGS
=========================== */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   GET BOOKING BY ID
=========================== */
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   UPDATE PAYMENT STATUS
=========================== */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body; // "PAID"

    const booking = await Booking.findById(id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    // Already processed
    if (booking.paymentStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Booking already paid or cancelled",
      });
    }

    // Expired
    if (booking.paymentExpiresAt < new Date()) {
      booking.paymentStatus = "CANCELLED";
      await booking.save();
      return res.status(400).json({ success: false, message: "Booking expired" });
    }

    // ✅ Mark booking PAID (NO BUS UPDATE)
    booking.paymentStatus = paymentStatus.toUpperCase();
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("Update Payment Status Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   DATE-WISE OCCUPIED SEATS
=========================== */
export const getOccupiedSeatsForDate = async (req, res) => {
  try {
    const { busId, date } = req.query;

    if (!busId || !date) {
      return res.status(400).json({
        success: false,
        message: "busId and date are required",
      });
    }

    const bookings = await Booking.find({
      "bus.id": new mongoose.Types.ObjectId(busId),
      "searchData.date": date,
      paymentStatus: "PAID", // ✅ only PAID seats block
    });

    const occupiedSeats = bookings.flatMap((b) => b.selectedSeats);

    res.status(200).json({ success: true, occupiedSeats });
  } catch (error) {
    console.error("Occupied seats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   ASSIGN AGENT SEATS (LAYOUT)
=========================== */
export const assignAgentSeats = async (req, res) => {
  try {
    const { agentId, seatNumbers } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    const agent = await Conductor.findById(agentId);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    bus.seats = bus.seats.map((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        return {
          ...seat.toObject(),
          agentAssigned: true,
          agentId,
          agentCode: agent.agentCode,
          isReservedForAgent: true,
        };
      }
      return seat;
    });

    await bus.save();
    res.status(200).json({ message: "Agent seats assigned", bus });
  } catch (error) {
    res.status(500).json({ message: "Failed", error });
  }
};
