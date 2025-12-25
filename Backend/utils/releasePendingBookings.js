import Booking from "../models/bookingModel.js";
import Bus from "../models/busModel.js";

export const releasePendingBookings = async () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  // Find all pending bookings older than 10 minutes
  const bookings = await Booking.find({
    paymentStatus: "Pending",
    createdAt: { $lte: tenMinutesAgo },
  });

  for (let booking of bookings) {
    // Release seats in bus
    const bus = await Bus.findById(booking.bus.id);
    if (!bus) continue;

    bus.seats = bus.seats.map((seat) => {
      if (booking.selectedSeats.includes(seat.seatNumber.toString())) {
        return { ...seat.toObject(), isOccupied: false };
      }
      return seat;
    });
    await bus.save();

    // Mark booking as cancelled
    booking.paymentStatus = "Cancelled";
    await booking.save();
  }
};

// Run every minute
setInterval(releasePendingBookings, 60 * 1000);
