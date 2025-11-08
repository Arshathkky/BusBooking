const Owner = require("../models/ownerModel");
const Bus = require("../models/busModel");
const Booking = require("../models/bookingModel");

// ------------------------------
// Get all owners
// ------------------------------
exports.getOwners = async (req, res) => {
  try {
    const owners = await Owner.find().sort({ createdAt: -1 });
    res.json(owners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Get single owner
// ------------------------------
exports.getOwnerById = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
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

    // Get all buses for this owner
    const buses = await Bus.find({ ownerId });

    const busIds = buses.map(b => b._id);

    const totalBuses = buses.length;

    const totalBookings = await Booking.countDocuments({ busId: { $in: busIds } });

    const totalRevenueAgg = await Booking.aggregate([
      { $match: { busId: { $in: busIds } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);

    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    const routes = buses.map(b => ({ routeId: b.routeId, busName: b.name }));

    res.json({
      owner,
      totalBuses,
      totalBookings,
      totalRevenue,
      buses,
      routes
    });
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
    const { name, email, phone, companyName, address, businessRegistrationNumber, taxId, registrationDocumentUrl } = req.body;

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
      registrationDocumentUrl
    });

    await owner.save();
    res.status(201).json(owner);
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
    const updateData = {};
    const fields = ["name", "email", "phone", "companyName", "address", "businessRegistrationNumber", "taxId", "registrationDocumentUrl", "status"];

    fields.forEach(f => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    const owner = await Owner.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
