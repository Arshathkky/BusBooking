import mongoose from "mongoose";

const conductorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },  // ✅ NEW FIELD

    assignedBusId: { type: String, default: null },
    ownerId: { type: String, required: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    role: {
      type: String,
      enum: ["conductor", "agent"],
      default: "conductor",
    },
    agentCode: { type: String, default: null },

  },
  { timestamps: true }
);

const Conductor = mongoose.model("Conductor", conductorSchema);

export default Conductor;
