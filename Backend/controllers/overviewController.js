import Bus from "../models/busModel.js";
import Conductor from "../models/conductorModel.js";
import Route from "../models/routeModel.js";
import Booking from "../models/bookingModel.js";
import mongoose from "mongoose";

export const getOwnerOverview = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const { month, date, busId } = req.query; // Filters

    // ---------------- Buses ----------------
    let busFilter = { ownerId };
    if (busId && busId !== "all") {
      busFilter._id = new mongoose.Types.ObjectId(busId);
    }
    const buses = await Bus.find(busFilter);
    const busIds = buses.map(b => b._id);
    const totalBuses = buses.length;
    const activeBuses = buses.filter(b => b.status === "active").length;

    // ---------------- Routes ----------------
    const routes = await Route.find({ ownerId });
    const totalRoutes = routes.length;
    const activeRoutes = routes.filter(r => r.status === "active").length;

    // ---------------- Conductors ----------------
    const conductors = await Conductor.find({ ownerId });
    const totalConductors = conductors.length;

    // ---------------- Date / Month Filter ----------------
    let startDate, endDate;
    const today = new Date();

    if (date) {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1); // next day
    } else if (month) {
      const [year, mon] = month.split("-").map(Number);
      startDate = new Date(year, mon - 1, 1);
      endDate = new Date(year, mon, 1); // next month
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    }

    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    // ---------------- Total / Today / Filtered Bookings ----------------
    const totalBookings = await Booking.countDocuments({ "bus.id": { $in: busIds } });

    // Today's bookings & earnings
    const todayStr = today.toISOString().split("T")[0];
    const todayAgg = await Booking.aggregate([
      { $match: { "bus.id": { $in: busIds }, "searchData.date": todayStr } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    const todayBookings = todayAgg[0]?.count || 0;
    const todayEarnings = todayAgg[0]?.total || 0;

    // ---------------- Filtered Bookings / Earnings ----------------
    const filteredAgg = await Booking.aggregate([
      { 
        $match: { 
          "bus.id": { $in: busIds },
          "searchData.date": { $gte: startStr, $lt: endStr }
        } 
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    const filteredBookings = filteredAgg[0]?.count || 0;
    const filteredEarnings = filteredAgg[0]?.total || 0;

    // ---------------- Monthly Earnings ----------------
    // If month is selected, calculate earnings for that month
    let monthlyAgg;
    if (month) {
      monthlyAgg = await Booking.aggregate([
        { 
          $match: { 
            "bus.id": { $in: busIds },
            "searchData.date": { $gte: startStr, $lt: endStr }
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
    } else {
      // Default to current month if no month selected
      const currMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const currMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      monthlyAgg = await Booking.aggregate([
        { 
          $match: { 
            "bus.id": { $in: busIds },
            "searchData.date": { $gte: currMonthStart.toISOString().split("T")[0], $lt: currMonthEnd.toISOString().split("T")[0] }
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
    }
    const monthlyEarnings = monthlyAgg[0]?.total || 0;

    // ---------------- Total revenue (all-time) ----------------
    const totalRevenueAgg = await Booking.aggregate([
      { $match: { "bus.id": { $in: busIds } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    res.json({
      success: true,
      data: {
        totalBuses,
        activeBuses,
        totalConductors,
        totalRoutes,
        activeRoutes,
        totalBookings,
        todayBookings,
        todayEarnings,
        filteredBookings,
        filteredEarnings,
        monthlyEarnings, // ✅ now always matches selected month
        totalRevenue,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
