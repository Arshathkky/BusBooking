import mongoose from "mongoose";

const seatRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    seats: { type: Number, required: true },
    busType: { type: String, required: true }, // e.g., Luxury, Semi-Luxury, Sleeper, Standard
    time: { type: String, required: true }, // Preferred departure time
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    notifiedOwners: [{ type: String }], // Array of matching ownerIds (stored as String for consistency with other schemas)
    replyMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("SeatRequest", seatRequestSchema);
