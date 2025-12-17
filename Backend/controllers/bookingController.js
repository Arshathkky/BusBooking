  import mongoose from "mongoose";
  import Booking from "../models/bookingModel.js";



  // ✅ Create a new booking
  export const createBooking = async (req, res) => {
    try {
      const booking = await Booking.create(req.body);
      res.status(201).json({ success: true, booking });
    } catch (error) {
      console.error("❌ Booking creation failed:", error);
      res.status(500).json({ success: false, message: error.message });
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

  // ✅ Update payment status
  export const updatePaymentStatus = async (req, res) => {
    try {
      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { paymentStatus: req.body.paymentStatus },
        { new: true }
      );
      res.status(200).json({ success: true, booking });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };



  export const getOccupiedSeatsForDate = async (req, res) => {
    try {
      const { busId, date } = req.query;

      if (!busId || !date) {
        return res.status(400).json({ success: false, message: "BusId and date are required" });
      }

      const bookings = await Booking.find({
        "bus.id": new mongoose.Types.ObjectId(busId), // ✅ use 'new'
        "searchData.date": date,
      });

      const occupiedSeats = bookings.flatMap(b => b.selectedSeats);

      res.status(200).json({ success: true, occupiedSeats });
    } catch (error) {
      console.error(error);
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
