const mongoose = require("mongoose");

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

    status: { type: String, enum: ["pending", "active", "suspended"], default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Owner", ownerSchema);
