const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ownerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    companyName: { type: String, required: true },
    address: { type: String },

    // Optional business registration details
    businessRegistrationNumber: { type: String },
    taxId: { type: String },
    registrationDocumentUrl: { type: String },

    password: { type: String, required: true, minlength: 6 }, // ✅ added password

    status: { type: String, enum: ["pending", "active", "suspended"], default: "pending" },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
ownerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Hash password when updating directly via findByIdAndUpdate
ownerSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model("Owner", ownerSchema);
