import mongoose from "mongoose";

const conductorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    assignedBusId: { type: String, default: null },
    ownerId: { type: String, required: true }, // ✅ identifies which owner this conductor belongs to
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Conductor = mongoose.model("Conductor", conductorSchema);

export default Conductor;
