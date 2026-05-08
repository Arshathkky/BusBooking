import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  nic: { type: String },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingId: Number,
    referenceId: String,

          bus: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
        name: { type: String, required: true },
        type: { type: String },
        busNumber: { type: String },
      },

    searchData: {
      from: String,
      to: String,
      date: String,
    },

    selectedSeats: [{ type: String, required: true }],

    totalAmount: Number,

    passengerDetails: passengerSchema,

    holdExpiresAt: {
      type: Date,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED", "BLOCKED", "OFFLINE"],
      default: "PENDING"
    },

    // 🔥 NEW FIELDS
    paymentExpiresAt: { type: Date, required: true },
    cancelRemark: { type: String, default: "" },
    cancelledBy: { type: String, enum: ["customer", "conductor", "admin"], default: null },
    pickupLocation: { type: String, default: "" },
  },
  { timestamps: true }
);


export default mongoose.model("Booking", bookingSchema);
