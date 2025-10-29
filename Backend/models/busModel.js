import mongoose from "mongoose";

// --------------------
// Seat Schema
// --------------------
const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  isLadiesOnly: { type: Boolean, default: false },
  isOccupied: { type: Boolean, default: false }, // ✅ track if seat is booked
});

// --------------------
// Bus Schema
// --------------------
const busSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true },
    type: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    price: { type: Number, required: true },
    routeId: { type: String, required: true },
    ladiesOnlySeats: { type: [Number], default: [] },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    amenities: { type: [String], default: [] },
    isSpecial: { type: Boolean, default: false },
    specialTime: { type: String },
    seats: { type: [seatSchema], default: [] }, // ✅ array of seats
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

const Bus = mongoose.model("Bus", busSchema);
export default Bus;
