  import mongoose from "mongoose";
  import Booking from "../models/bookingModel.js";
import Bus from "../models/busModel.js"; // ✅ add this
import Conductor from "../models/conductorModel.js"; // if using assignAgentSeats

import { Counter } from "../models/counterModal.js";

export const createBooking = async (req, res) => {
  try {
    // 1️⃣ Generate bookingId
    const counter = await Counter.findOneAndUpdate(
      { name: "booking" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const bookingId = counter.seq;

    // 2️⃣ Extract data
    const { searchData, selectedSeats, bus } = req.body;

    // 3️⃣ Generate referenceId
    const seatPart = selectedSeats.join("");
    const referenceId = `${searchData.date}-${seatPart}-${bus.busNumber || bus.name}`;

    // 4️⃣ 🔥 Create 10-min hold/payment expiry
    const now = new Date();
    const HOLD_MINUTES = 10;
    const expiryTime = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

    // 5️⃣ Create booking
    const booking = await Booking.create({
      ...req.body,
      bookingId,
      referenceId,
      holdExpiresAt: expiryTime,       // ✅ required field
      paymentExpiresAt: expiryTime,    // ✅ required field
      paymentStatus: "PENDING"         // ✅ default status
    });

    res.status(201).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Booking creation failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





  // ✅ Get all bookings
  export const getAllBookings = async (req, res) => {
    try {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, bookings });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // ✅ Get a booking by ID
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

  export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Only pending bookings allowed
    if (booking.paymentStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Booking already paid or cancelled",
      });
    }

    // Check expiry
    if (booking.paymentExpiresAt < new Date()) {
      booking.paymentStatus = "CANCELLED";
      await booking.save();

      return res.status(400).json({
        success: false,
        message: "Payment time expired",
      });
    }

    // ✅ Mark booking as PAID
    booking.paymentStatus = paymentStatus.toUpperCase(); // "PAID"
    await booking.save();

    // ❌ DO NOT touch Bus.seats here

    res.status(200).json({
      success: true,
      message: "Payment successful",
      booking,
    });
  } catch (error) {
    console.error("Payment update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};





  export const getOccupiedSeatsForDate = async (req, res) => {
  try {
    const { busId, date } = req.query;

    const bookings = await Booking.find({
      "bus.id": new mongoose.Types.ObjectId(busId),
      "searchData.date": date,
      paymentStatus: "PAID",
    });

    const occupiedSeats = bookings.flatMap(b => b.selectedSeats);

    res.status(200).json({ success: true, occupiedSeats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
          isOccupied: false,
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


