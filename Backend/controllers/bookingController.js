import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Bus from "../models/busModel.js";
import Conductor from "../models/conductorModel.js";
import { Counter } from "../models/counterModal.js";

const MUTEX = {};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ===========================
   CREATE BOOKING (PENDING)
=========================== */
export const createBooking = async (req, res) => {
  const { searchData, selectedSeats, bus } = req.body;
  const lockKey = `${bus.id}-${searchData.date}`;

  // Acquire Lock
  while (MUTEX[lockKey]) {
    await wait(50);
  }
  MUTEX[lockKey] = true;

  try {
    // 2️⃣ 🔥 CONCURRENCY CHECK — reject if any seat is already locked
    const seatNumbers = selectedSeats.map(Number);
    const conflicting = await Booking.findOne({
      "bus.id": bus.id,
      "searchData.date": searchData.date,
      selectedSeats: { $in: seatNumbers },
      $or: [
        { paymentStatus: "PAID" },
        { paymentStatus: "PENDING", holdExpiresAt: { $gt: new Date() } }
      ]
    });

    if (conflicting) {
      const overlap = conflicting.selectedSeats.filter(s => seatNumbers.includes(s));
      return res.status(409).json({
        success: false,
        message: `Seat(s) ${overlap.join(", ")} already reserved by another user`,
      });
    }

    // 3️⃣ Auto-increment bookingId
    const counter = await Counter.findOneAndUpdate(
      { name: "booking" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const bookingId = counter.seq;

    // 4️⃣ Reference ID
    const referenceId = `${searchData.date}-${selectedSeats.join("")}-${bus.busNumber || bus.name}`;

    // 5️⃣ Hold & payment expiry (15 mins)
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);

    // 6️⃣ Create booking (DATE-WISE)
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
  } finally {
    // Release Lock
    delete MUTEX[lockKey];
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
   UPDATE BOOKING DETAILS
=========================== */
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { passengerDetails, totalAmount } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.paymentStatus !== "PENDING") {
      return res.status(400).json({ success: false, message: "Only pending bookings can be updated" });
    }

    if (passengerDetails) booking.passengerDetails = passengerDetails;
    if (totalAmount) booking.totalAmount = totalAmount;

    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("Update Booking Error:", error);
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

    const paidBookings = await Booking.find({
      "bus.id": new mongoose.Types.ObjectId(busId),
      "searchData.date": date,
      paymentStatus: "PAID"
    });

    const pendingBookings = await Booking.find({
      "bus.id": new mongoose.Types.ObjectId(busId),
      "searchData.date": date,
      paymentStatus: "PENDING", 
      holdExpiresAt: { $gt: new Date() } 
    });

    const occupiedSeats = paidBookings.flatMap((b) => b.selectedSeats);
    const reservedSeats = pendingBookings.flatMap((b) => b.selectedSeats);

    res.status(200).json({ success: true, occupiedSeats, reservedSeats });
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
