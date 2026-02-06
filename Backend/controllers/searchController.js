import Booking from "../models/bookingModel.js";
import Route from "../models/routeModel.js";
import Bus from "../models/busModel.js";

export const searchBuses = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ message: "From, To, Date required" });
    }

    // 1️⃣ Find matching routes
    const routes = await Route.find({ status: "active" });

    const matchingRoutes = routes.filter(route => {
      const stops = [
        route.startPoint,
        ...(route.stops || []),
        route.endPoint,
      ].map(s => s.toLowerCase());

      const fromIndex = stops.indexOf(from.toLowerCase());
      const toIndex = stops.indexOf(to.toLowerCase());

      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });

    if (!matchingRoutes.length) {
      return res.json({ buses: [] });
    }

    const routeIds = matchingRoutes.map(r => r._id);

    // 2️⃣ Get buses
    const buses = await Bus.find({
      routeId: { $in: routeIds },
      status: "active",
    });

    // 3️⃣ Get PAID bookings ONLY (date-wise)
    const paidBookings = await Booking.find({
      "searchData.date": date,
      paymentStatus: "PAID",
    });

    const now = new Date();

    const results = buses.map(bus => {
      // Booked seats (PAID only)
      const busBookings = paidBookings.filter(
        b => b.bus.id.toString() === bus._id.toString()
      );

      const bookedSeatsCount = busBookings.reduce(
        (sum, b) => sum + b.selectedSeats.length,
        0
      );

      // Held seats (real-time)
      const heldSeatsCount = bus.seats.filter(
        s => s.isHeld && s.holdExpiresAt && s.holdExpiresAt > now
      ).length;

      const seatsAvailable =
        bus.totalSeats - bookedSeatsCount - heldSeatsCount;

      const route = matchingRoutes.find(
        r => r._id.toString() === bus.routeId.toString()
      );

      return {
        id: bus._id,
        name: bus.name,
        type: bus.type,
        company: bus.companyName,
        routeId: bus.routeId,
        startPoint: route?.startPoint,
        endPoint: route?.endPoint,
        stops: route?.stops || [],
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        duration: bus.duration,
        price: bus.price,
        totalSeats: bus.totalSeats,                 // ✅ ADD
        seatsAvailable: Math.max(seatsAvailable, 0),
        status: bus.status,
      };
    });

    res.json({ buses: results });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};
