import mongoose from "mongoose";

const busRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    pickupPlace: { type: String, required: true },
    comments: { type: String, default: "" },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
    busName: { type: String, required: true },
    ownerId: { type: String },
    searchData: {
      from: { type: String, required: true },
      to: { type: String, required: true },
      date: { type: String, required: true },
    },
    status: { type: String, enum: ["pending", "processed"], default: "pending" },
  },
  { timestamps: true }
);

const BusRequest = mongoose.model("BusRequest", busRequestSchema);
export default BusRequest;
