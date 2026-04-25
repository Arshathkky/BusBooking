import Owner from "../models/ownerModel.js";
import Bus from "../models/busModel.js";
import Conductor from "../models/conductorModel.js";
import Route from "../models/routeModel.js";
import Booking from "../models/bookingModel.js";
import bcrypt from "bcryptjs";

// ------------------------------
// Get all owners
// ------------------------------
export const getOwners = async (req, res) => {
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
export const getOwnerById = async (req, res) => {
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
export const getOwnerDetails = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const { month, date, busId } = req.query;

    const owner = await Owner.findById(ownerId);
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    // Base filters
    const buses = await Bus.find({ ownerId });
    const busIds = buses.map(b => b._id.toString());
    
    // Filter by specific bus if requested
    const targetBusIds = busId && busId !== "all" ? [busId] : busIds;

    // --- Statistics ---
    const totalBuses = buses.length;
    const activeBusesCount = buses.filter(b => b.status === "active").length;
    const totalRoutes = await Route.countDocuments({ ownerId });
    const activeRoutes = await Route.countDocuments({ ownerId, status: "active" });
    const totalConductors = await Conductor.countDocuments({ ownerId });

    // --- Dynamic Filters for Revenue/Bookings ---
    let matchFilter = { busId: { $in: targetBusIds } };

    // Handle Specific Date or Month
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      // We check both searchData.date (travel date) AND createdAt? 
      // Usually earnings are based on the date the bus runs.
      matchFilter["searchData.date"] = date; 
    } else if (month) {
      // Month format: YYYY-MM
      const [year, m] = month.split("-");
      const regex = new RegExp(`^${year}-${m}`); 
      matchFilter["searchData.date"] = { $regex: regex };
    }

    // Bookings for selected range
    const filteredBookings = await Booking.countDocuments(matchFilter);

    // Earnings for selected range
    const earningsAgg = await Booking.aggregate([
      { $match: { ...matchFilter, paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const filteredEarnings = earningsAgg[0]?.total || 0;

    // Monthly stats (always show current month if nothing selected)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthAgg = await Booking.aggregate([
      { 
        $match: { 
          busId: { $in: busIds }, 
          "searchData.date": { $regex: new RegExp(`^${currentMonth}`) },
          paymentStatus: "Paid"
        } 
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    res.json({
      success: true,
      data: {
        totalBuses,
        activeBuses: activeBusesCount,
        totalConductors,
        totalRoutes,
        activeRoutes,
        totalBookings: await Booking.countDocuments({ busId: { $in: busIds } }),
        filteredBookings,
        filteredEarnings,
        todayBookings: filteredBookings, // For UI compatibility
        todayEarnings: filteredEarnings, // For UI compatibility
        monthlyEarnings: monthAgg[0]?.total || 0,
        totalRevenue: filteredEarnings // In this context
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
export const loginOwner = async (req, res) => {
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
export const addOwner = async (req, res) => {
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
      canAddBuses,
      canAddConductors,
      canManageBookings,
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
      canAddBuses,
      canAddConductors,
      canManageBookings,
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
export const updateOwner = async (req, res) => {
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
      "canAddBuses",
      "canAddConductors",
      "canManageBookings",
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
export const deleteOwner = async (req, res) => {
  try {
    const owner = await Owner.findByIdAndDelete(req.params.id);
    if (!owner) return res.status(404).json({ message: "Owner not found" });
    res.json({ message: "Owner deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
