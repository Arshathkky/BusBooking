import mongoose from "mongoose";

// -------------------- Seat Schema --------------------
const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },

  isLadiesOnly: { type: Boolean, default: false },

  // Conductor info
  conductorAssigned: { type: Boolean, default: false },
  conductorCode: { type: String, default: null },
  conductorId: { type: String, default: null },
  isReservedForConductor: { type: Boolean, default: false },
  // Permanent occupancy
  isOccupied: { type: Boolean, default: false },
  // Online availability
  isOnline: { type: Boolean, default: true },
});

// -------------------- Bus Schema --------------------
const busSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true },
    type: { type: String, required: true }, // e.g., sleeper, semi-sleeper
    totalSeats: { type: Number, required: true },
    price: { type: Number, required: true },

    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },

    ladiesOnlySeats: { type: [Number], default: [] },

    seats: { type: [seatSchema], default: [] },

    ownerId: { type: String },

    busNumber: { type: String, required: true },

    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // -------------------- Seat Layout --------------------
    seatLayout: {
      type: String,
      enum: ["2x2", "2x3"],
      default: "2x2",
      required: true,
    },

    seatNumberingType: {
      type: String,
      enum: ["driver_side", "door_side"],
      default: "driver_side",
      required: true,
    },

    lastRowSeats: {
      type: Number,
      default: 4,
      required: true,
      min: 1,
      max: 10,
    },

    // ✅ New: Days-based scheduling (Monday, Tuesday, etc.)
    schedule: {
      type: [String],
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
  },
  { timestamps: true }
);

export default mongoose.model("Bus", busSchema);