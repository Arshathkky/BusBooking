import Booking from "../models/bookingModel.js";
import Bus from "../models/busModel.js";

export const releasePendingBookings = async () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  // Find all pending bookings that have expired
  const now = new Date();
  const bookings = await Booking.find({
    paymentStatus: "PENDING",
    holdExpiresAt: { $lte: now },
  });

  for (let booking of bookings) {
    // Note: In the new date-wise system, we don't need to update the main Bus seats 
    // because occupancy is determined by the existence of a booking.
    // However, we mark the booking as CANCELLED so it's no longer counted.
    booking.paymentStatus = "CANCELLED";
    await booking.save();
  }
};

// Run every minute
export const startReleaseInterval = () => {
  setInterval(releasePendingBookings, 60 * 1000);
};
