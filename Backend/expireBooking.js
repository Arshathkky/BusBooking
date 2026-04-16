import cron from "node-cron";
import Booking from "./models/bookingModel.js";
import Bus from "./models/busModel.js";

cron.schedule("*/1 * * * *", async () => {
  const now = new Date();

  const expiredBookings = await Booking.find({
    paymentStatus: "PENDING",
    holdExpiresAt: { $lt: now }
  });

  for (const booking of expiredBookings) {
    booking.paymentStatus = "CANCELLED";
    await booking.save();

    console.log(`⏰ Booking ${booking._id} expired`);
  }
});
