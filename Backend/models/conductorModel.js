import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const conductorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },

    assignedBusId: { type: String, default: null },
    ownerId: { type: String, required: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    role: {
      type: String,
      enum: ["conductor"],
      default: "conductor",
    },

    conductorCode: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // allows null values
    },

    city: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Hash password before saving (create)
conductorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Hash password when updating via findByIdAndUpdate
conductorSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
    this.setUpdate(update);
  }
  next();
});

const Conductor = mongoose.model("Conductor", conductorSchema);

export default Conductor;