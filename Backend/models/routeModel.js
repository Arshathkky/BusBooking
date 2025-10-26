import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startPoint: { type: String, required: true },
    endPoint: { type: String, required: true },
    stops: { type: [String], default: [] },
    distance: { type: Number, required: true },
    duration: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Route", routeSchema);
