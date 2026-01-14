import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },

  isLadiesOnly: { type: Boolean, default: false },

  // Permanent booking
  // isOccupied: { type: Boolean, default: false },

  // Agent info
  agentAssigned: { type: Boolean, default: false },
  agentCode: { type: String, default: null },
  agentId: { type: String, default: null },
  isReservedForAgent: { type: Boolean, default: false },

  // 🔥 SEAT HOLD (NEW)
  isHeld: { type: Boolean, default: false },
  heldBy: { type: String, default: null }, // sessionId / userId
  holdExpiresAt: { type: Date, default: null },
});


const busSchema = new mongoose.Schema(
  {
    name: String,
    companyName: String,
    departureTime: String,
    arrivalTime: String,
    duration: String,
    type: String,
    totalSeats: Number,
    price: Number,

    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },

    ladiesOnlySeats: { type: [Number], default: [] },

    seats: { type: [seatSchema], default: [] },

    ownerId: String,
    busNumber: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Bus", busSchema);
