import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  nic: { type: String },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: Number,
      unique: true,
    },

    referenceId: {
      type: String,
      unique: true,
    },

    bus: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
      name: { type: String, required: true },
      type: { type: String },
      busNumber: { type: String }, // ✅ REQUIRED for referenceId
    },

    searchData: {
      from: { type: String, required: true },
      to: { type: String, required: true },
      date: { type: String, required: true },
    },

    selectedSeats: [{ type: String, required: true }],

    totalAmount: { type: Number, required: true },

    passengerDetails: {
      type: passengerSchema,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
