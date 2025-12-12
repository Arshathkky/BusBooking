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

    // Filter for filtered bookings (by selected date or month)
    if (date) {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
    } else if (month) {
      const [year, mon] = month.split("-").map(Number);
      startDate = new Date(year, mon - 1, 1);
      endDate = new Date(year, mon, 1);
    } else {
      // default to current month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    }

    // ---------------- Bookings ----------------
    // Total bookings (all-time for this owner's buses)
    const totalBookings = await Booking.countDocuments({ "bus.id": { $in: busIds } });

    // Today's bookings & earnings (based on searchData.date)
    const todayStr = today.toISOString().split("T")[0];
    const todayBookingsAgg = await Booking.aggregate([
      { $match: { "bus.id": { $in: busIds }, "searchData.date": todayStr } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    const todayBookings = todayBookingsAgg[0]?.count || 0;
    const todayEarnings = todayBookingsAgg[0]?.total || 0;

    // Monthly earnings (all bookings in the selected month)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthlyAgg = await Booking.aggregate([
      { 
        $match: { 
          "bus.id": { $in: busIds },
          "searchData.date": { $gte: monthStart.toISOString().split("T")[0], $lt: monthEnd.toISOString().split("T")[0] }
        } 
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    const monthlyEarnings = monthlyAgg[0]?.total || 0;

    // Filtered bookings & earnings (based on filter date/month + bus)
    const filteredBookingsAgg = await Booking.aggregate([
      { 
        $match: { 
          "bus.id": { $in: busIds },
          "searchData.date": date ? date : { $gte: startDate.toISOString().split("T")[0], $lt: endDate.toISOString().split("T")[0] }
        } 
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    const filteredBookings = filteredBookingsAgg[0]?.count || 0;
    const filteredEarnings = filteredBookingsAgg[0]?.total || 0;

    // Total revenue (all-time)
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
        monthlyEarnings, // total for the month
        filteredBookings,
        filteredEarnings, // this is for filtered date/month
        totalRevenue,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
