import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Bus from "../models/busModel.js";
import Conductor from "../models/conductorModel.js";
import { Counter } from "../models/counterModal.js";
import crypto from "crypto";
import { sendSMS } from "../utils/smsService.js";

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
    const isOwnerOverride = searchData.from === 'Owner Override';

    // 2️⃣ 🔥 CONCURRENCY CHECK — reject if any seat is already locked
    const seatNumbers = selectedSeats.map(String);
    const conflicting = await Booking.findOne({
      "bus.id": bus.id,
      "searchData.date": searchData.date,
      selectedSeats: { $in: seatNumbers },
      $or: [
        { paymentStatus: "PAID" },
        // If it's a customer booking, block if any status exists. 
        // If it's an owner booking (Override), we might want to allow it, but for now let's just add the statuses to the block list.
        { paymentStatus: "BLOCKED" },
        { paymentStatus: "OFFLINE" },
        { paymentStatus: "PENDING", holdExpiresAt: { $gt: new Date() } }
      ]
    });

    if (conflicting && !isOwnerOverride) {
      const overlap = conflicting.selectedSeats.filter(s => seatNumbers.includes(s));
      return res.status(409).json({
        success: false,
        message: `Seat(s) ${overlap.join(", ")} already reserved by another user`,
      });
    }

    // If owner override, delete all conflicting non-paid bookings for these seats
    if (isOwnerOverride) {
        await Booking.deleteMany({
            "bus.id": new mongoose.Types.ObjectId(bus.id),
            "searchData.date": searchData.date,
            selectedSeats: { $in: seatNumbers },
            paymentStatus: { $ne: "PAID" }
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

    // 5️⃣ Hold & payment expiry (15 mins for customers, far future for owner actions)
    const isPermanentStatus = ["PAID", "BLOCKED", "OFFLINE"].includes(req.body.paymentStatus) || isOwnerOverride;
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
    const farFuture = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);

    // 6️⃣ Create booking (DATE-WISE)
    const booking = await Booking.create({
      ...req.body,
      bookingId,
      referenceId,
      holdExpiresAt: isPermanentStatus ? farFuture : expiryTime,
      paymentExpiresAt: isPermanentStatus ? farFuture : expiryTime,
      paymentStatus: req.body.paymentStatus || "PENDING",
    });

    res.status(201).json({ success: true, booking });

    // 📩 Send SMS if requested and phone is present
    const shouldSendSMS = req.body.sendSMS !== false; // Default to true if not provided
    if (booking.passengerDetails?.phone && shouldSendSMS && (booking.paymentStatus === "PAID" || booking.paymentStatus === "BLOCKED" || isOwnerOverride)) {
        let msg = "";
        if (booking.paymentStatus === "PAID") {
            msg = `Booking Confirmed!\nBus: ${booking.bus.name}\nSeats: ${booking.selectedSeats.join(", ")}\nDate: ${booking.searchData.date}\nRef: ${booking.referenceId}\nThank you!`;
        } else {
            // For PENDING/RESERVED or BLOCKED
            msg = `Reservation Confirmed!\nBus: ${booking.bus.name}\nSeats: ${booking.selectedSeats.join(", ")}\nDate: ${booking.searchData.date}\nRef: ${booking.referenceId}\nPlease pay at the counter.`;
        }
        
        // Send to Passenger
        sendSMS(booking.passengerDetails.phone, msg);

        // ✅ Also send to Owner if enabled
        try {
            const busDetails = await Bus.findById(booking.bus.id);
            if (busDetails && busDetails.notifyOwnerOnBooking && busDetails.ownerPhoneForSMS) {
                const ownerMsg = `[OWNER COPY] ${msg}`;
                sendSMS(busDetails.ownerPhoneForSMS, ownerMsg);
            }
        } catch (err) {
            console.error("Owner SMS failed:", err);
        }
    }
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

    // 📩 Send SMS if Paid
    if (booking.paymentStatus === "PAID" && booking.passengerDetails?.phone) {
        const msg = `Booking Confirmed!\nBus: ${booking.bus.name}\nSeats: ${booking.selectedSeats.join(", ")}\nDate: ${booking.searchData.date}\nRef: ${booking.referenceId}\nThank you!`;
        sendSMS(booking.passengerDetails.phone, msg);
    }

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

    const allActiveBookings = await Booking.find({
      "bus.id": new mongoose.Types.ObjectId(busId),
      "searchData.date": date,
      paymentStatus: { $in: ["PAID", "PENDING", "BLOCKED", "OFFLINE", "ONLINE"] }
    });

    // Fetch Bus to get global blocks
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    const occupiedSeats = [];
    const reservedSeats = [];
    const blockedSeats = [];
    const offlineSeats = [];
    const onlineOverrides = [];

    // 1. Process Overrides from Bookings
    allActiveBookings.forEach(b => {
      if (b.paymentStatus === "PENDING" && b.holdExpiresAt < new Date()) return;

      b.selectedSeats.forEach(seatNum => {
        const info = {
          seatNumber: seatNum,
          passengerName: b.passengerDetails?.name || (b.paymentStatus === "BLOCKED" ? "BLOCKED" : "RESERVED"),
          bookingId: b.bookingId,
          status: b.paymentStatus,
          pickupLocation: b.pickupLocation
        };

        if (b.paymentStatus === "PAID") occupiedSeats.push(info);
        else if (b.paymentStatus === "PENDING") reservedSeats.push(info);
        else if (b.paymentStatus === "BLOCKED") blockedSeats.push(info);
        else if (b.paymentStatus === "OFFLINE") offlineSeats.push(info);
        else if (b.paymentStatus === "ONLINE") onlineOverrides.push(info);
      });
    });

    // 2. Process Global States from Bus (if not overridden by a booking)
    const overriddenSeatNums = new Set([
      ...occupiedSeats.map(s => String(s.seatNumber)),
      ...reservedSeats.map(s => String(s.seatNumber)),
      ...blockedSeats.map(s => String(s.seatNumber)),
      ...offlineSeats.map(s => String(s.seatNumber)),
      ...onlineOverrides.map(s => String(s.seatNumber))
    ]);

    bus.seats.forEach(seat => {
        const sNum = String(seat.seatNumber);
        if (overriddenSeatNums.has(sNum)) return;

        if (seat.isPermanent) {
            blockedSeats.push({ seatNumber: sNum, status: "PERMANENT", passengerName: "PERMANENT BLOCK" });
        } else if (seat.isOnline === false) {
            blockedSeats.push({ seatNumber: sNum, status: "GLOBAL_BLOCK", passengerName: "MANUAL ONLY" });
        }
    });

    res.status(200).json({ success: true, occupiedSeats, reservedSeats, blockedSeats, offlineSeats, onlineOverrides });
  } catch (error) {
    console.error("Occupied seats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   CANCEL BOOKING (WITH REMARK)
=========================== */
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark, cancelledBy } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.paymentStatus = "CANCELLED";
    booking.cancelRemark = remark || "No remark provided";
    booking.cancelledBy = cancelledBy || "conductor";
    await booking.save();

    res.status(200).json({ success: true, message: "Booking cancelled", booking });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   ASSIGN CONDUCTOR SEATS (REPLACING AGENT)
=========================== */
export const assignConductorSeats = async (req, res) => {
  try {
    const { conductorId, seatNumbers } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    const conductor = await Conductor.findById(conductorId);
    if (!conductor) return res.status(404).json({ message: "Conductor not found" });

    bus.seats = bus.seats.map((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        return {
          ...seat.toObject(),
          conductorAssigned: true,
          conductorId,
          conductorCode: conductor.conductorCode,
          isReservedForConductor: true,
        };
      }
      return seat;
    });

    await bus.save();
    res.status(200).json({ message: "Conductor seats assigned", bus });
  } catch (error) {
    res.status(500).json({ message: "Failed", error });
  }
};

/* ===========================
   GET RECENT BOOKINGS FOR OWNER
=========================== */
export const getOwnerRecentBookings = async (req, res) => {
  try {
    const { busIds } = req.body; 
    if (!busIds || !Array.isArray(busIds)) return res.status(400).json({ success: false, message: "Invalid busIds" });
    
    // In search result, we store bus as {id: string, name: string...}
    // We match the bus.id field in Booking schema
    const bookings = await Booking.find({ 
      "bus.id": { $in: busIds }
    })
    .sort({ createdAt: -1 })
    .limit(10);
    
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   UNBLOCK SEATS FOR ALL DAYS
=========================== */
export const unblockSeatsAllDays = async (req, res) => {
  try {
    const { busId, seatNumbers } = req.body;
    if (!busId || !seatNumbers || !Array.isArray(seatNumbers)) {
      return res.status(400).json({ success: false, message: "Invalid busId or seatNumbers" });
    }

    const seatsToUnblock = seatNumbers.map(String);

    // Find and delete/cancel all BLOCKED, OFFLINE, or PENDING bookings for these seats across ALL dates
    const result = await Booking.deleteMany({
      "bus.id": new mongoose.Types.ObjectId(busId),
      paymentStatus: { $in: ["BLOCKED", "OFFLINE", "PENDING", "ONLINE"] },
      selectedSeats: { $in: seatsToUnblock }
    });

    res.status(200).json({ 
      success: true, 
      message: `Unblocked seats for all days. Removed ${result.deletedCount} block records.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Unblock all days error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleCheckIn = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.isCheckedIn = !booking.isCheckedIn;
    await booking.save();

    res.status(200).json({ success: true, isCheckedIn: booking.isCheckedIn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
