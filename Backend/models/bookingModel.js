import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
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

    selectedSeats: [{ type: Number, required: true }],

    totalAmount: Number,

    passengerDetails: passengerSchema,

    holdExpiresAt: {
      type: Date,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED"],
      default: "PENDING"
    },

    // 🔥 NEW FIELDS
    paymentExpiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);


export default mongoose.model("Booking", bookingSchema);
