import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    bus: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
      name: { type: String, required: true },
      type: { type: String },
    },
    searchData: {
      from: { type: String, required: true },
      to: { type: String, required: true },
      date: { type: String, required: true },
    },
    selectedSeats: [{ type: String, required: true }],
    totalAmount: { type: Number, required: true },
    passengerDetails: { type: passengerSchema, required: true },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
