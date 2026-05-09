import Booking from "../models/bookingModel.js";
import Bus from "../models/busModel.js";

export const getDailyReport = async (req, res) => {
    try {
        const { date, ownerId } = req.query;
        if (!date) return res.status(400).json({ success: false, message: "Date is required" });

        // Fetch bookings for this owner and date
        const query = { "searchData.date": date };
        if (ownerId) {
            const buses = await Bus.find({ ownerId });
            const busIds = buses.map(b => b._id.toString());
            query["bus.id"] = { $in: busIds };
        }

        const bookings = await Booking.find(query);
        
        const summary = {
            totalBookings: bookings.length,
            totalSeats: bookings.reduce((acc, b) => acc + b.selectedSeats.length, 0),
            totalRevenue: bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0),
            paidBookings: bookings.filter(b => b.paymentStatus === "PAID").length,
            pendingBookings: bookings.filter(b => b.paymentStatus === "PENDING").length,
            blockedBookings: bookings.filter(b => b.paymentStatus === "BLOCKED").length,
        };

        res.status(200).json({ success: true, summary, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAggregatedReport = async (req, res) => {
    try {
        const { type, ownerId } = req.query; // type: weekly, monthly, yearly
        
        let dateFilter = {};
        const now = new Date();
        
        if (type === "weekly") {
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = { createdAt: { $gte: lastWeek } };
        } else if (type === "monthly") {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            dateFilter = { createdAt: { $gte: lastMonth } };
        } else if (type === "yearly") {
            const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            dateFilter = { createdAt: { $gte: lastYear } };
        }

        const query = { ...dateFilter, paymentStatus: "PAID" };
        if (ownerId) {
            const buses = await Bus.find({ ownerId });
            const busIds = buses.map(b => b._id.toString());
            query["bus.id"] = { $in: busIds };
        }

        const bookings = await Booking.find(query);

        // Group by day/month for charts
        const stats = bookings.reduce((acc, b) => {
            const dateStr = b.searchData.date;
            if (!acc[dateStr]) acc[dateStr] = { revenue: 0, count: 0 };
            acc[dateStr].revenue += (b.totalAmount || 0);
            acc[dateStr].count += 1;
            return acc;
        }, {});

        res.status(200).json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
