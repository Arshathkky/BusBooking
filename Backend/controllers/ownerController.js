const Owner = require("../models/ownerModel");
const Bus = require("../models/busModel");
const Conductor = require("../models/conductorModel");
const Route = require("../models/routeModel");
const Booking = require("../models/bookingModel");
const bcrypt = require("bcryptjs");

// ------------------------------
// Get all owners
// ------------------------------
exports.getOwners = async (req, res) => {
  try {
    const owners = await Owner.find().sort({ createdAt: -1 }).select("-password");
    res.json(owners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Get single owner by ID
// ------------------------------
exports.getOwnerById = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id).select("-password");
    if (!owner) return res.status(404).json({ message: "Owner not found" });
    res.json(owner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Get owner details with stats
// ------------------------------
exports.getOwnerDetails = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const owner = await Owner.findById(ownerId);
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    const buses = await Bus.find({ ownerId });
    const busIds = buses.map(b => b._id);

    const totalBuses = buses.length;
    const totalBookings = await Booking.countDocuments({ busId: { $in: busIds } });

    const totalRevenueAgg = await Booking.aggregate([
      { $match: { busId: { $in: busIds } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    const routes = await Route.find({ ownerId });
    const totalRoutes = routes.length;
    const activeRoutes = routes.filter(r => r.status === "active").length;

    const conductors = await Conductor.find({ ownerId });
    const totalConductors = conductors.length;

    // Example: today bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todayBookings = await Booking.countDocuments({
      busId: { $in: busIds },
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // Monthly earnings (example: this month)
    const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const monthlyEarningsAgg = await Booking.aggregate([
      { $match: { busId: { $in: busIds }, createdAt: { $gte: startMonth, $lt: endMonth } } },
      { $group: { _id: null, monthlyEarnings: { $sum: "$totalAmount" } } }
    ]);
    const monthlyEarnings = monthlyEarningsAgg[0]?.monthlyEarnings || 0;

    res.json({
      success: true,
      data: {
        totalBuses,
        activeBuses: buses.filter(b => b.status === "active").length,
        totalConductors,
        totalRoutes,
        activeRoutes,
        totalBookings,
        todayBookings,
        totalRevenue,
        monthlyEarnings,
        totalEarnings: totalRevenue
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------
// Owner login
// ------------------------------
exports.loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    const owner = await Owner.findOne({ email });
    if (!owner) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const { password: _, ...ownerData } = owner.toObject(); // remove password
    res.status(200).json(ownerData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Add new owner
// ------------------------------
exports.addOwner = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      companyName,
      address,
      businessRegistrationNumber,
      taxId,
      registrationDocumentUrl,
      password,
    } = req.body;

    const existing = await Owner.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const owner = new Owner({
      name,
      email,
      phone,
      companyName,
      address,
      businessRegistrationNumber,
      taxId,
      registrationDocumentUrl,
      password,
    });

    await owner.save();

    const { password: _, ...ownerData } = owner.toObject();
    res.status(201).json(ownerData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Update owner
// ------------------------------
exports.updateOwner = async (req, res) => {
  try {
    const fields = [
      "name",
      "email",
      "phone",
      "companyName",
      "address",
      "businessRegistrationNumber",
      "taxId",
      "registrationDocumentUrl",
      "status",
      "password",
    ];

    const updateData = {};
    fields.forEach(f => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    const owner = await Owner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!owner) return res.status(404).json({ message: "Owner not found" });
    res.json(owner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Delete owner
// ------------------------------
exports.deleteOwner = async (req, res) => {
  try {
    const owner = await Owner.findByIdAndDelete(req.params.id);
    if (!owner) return res.status(404).json({ message: "Owner not found" });
    res.json({ message: "Owner deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
