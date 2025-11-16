import mongoose from "mongoose";

// --------------------
// Seat Schema
// --------------------
const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },

  // 🚺 Whether seat is ladies only
  isLadiesOnly: { type: Boolean, default: false },

  // 🧍‍♂️ Whether seat is occupied (booked by passenger)
  isOccupied: { type: Boolean, default: false },

  // 🧾 Whether seat is assigned to an agent
  agentAssigned: { type: Boolean, default: false },

  // 🧑‍💼 Agent details (if assigned)
  agentCode: { type: String, default: null },
  agentId: { type: String, default: null },

  // ✅ Optional: mark seat as reserved for agent (can’t be booked by others)
  isReservedForAgent: { type: Boolean, default: false },

  // Optional: track last booking info for analytics
  lastBookedAt: { type: Date, default: null },
  lastBookedBy: { type: String, default: null },
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

    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },

    ladiesOnlySeats: { type: [Number], default: [] },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    amenities: { type: [String], default: [] },

    // 🌙 Special trips or timings
    isSpecial: { type: Boolean, default: false },
    specialTime: { type: String },

    // 💺 All seat details (each seat has sub-schema above)
    seats: { type: [seatSchema], default: [] },

    // 🧑‍💼 Owner of the bus
    ownerId: { type: String, required: true },

    // 🚌 Optional unique bus number/plate
    busNumber: { type: String },

    // 📅 Track creation/update times
  },
  { timestamps: true }
);

const Bus = mongoose.model("Bus", busSchema);
export default Bus;
