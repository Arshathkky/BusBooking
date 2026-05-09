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
    
    // Calculate Day of Week
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const searchDateObj = new Date(date);
    const dayOfWeek = days[searchDateObj.getDay()];

    // 2️⃣ Get buses that run on this day
    const buses = await Bus.find({
      routeId: { $in: routeIds },
      status: "active",
      schedule: { $in: [dayOfWeek] }
    });

    // 3️⃣ Get ALL bookings (PAID, PENDING, BLOCKED, OFFLINE) for accurate availability
    const now = new Date();
    const allBookings = await Booking.find({
      "searchData.date": date,
      paymentStatus: { $in: ["PAID", "PENDING", "BLOCKED", "OFFLINE"] },
    });

    const results = buses.map(bus => {
      // Filter bookings for this specific bus
      const busBookings = allBookings.filter(
        b => b.bus.id.toString() === bus._id.toString() &&
        (b.paymentStatus !== "PENDING" || (b.holdExpiresAt && new Date(b.holdExpiresAt) > now))
      );

      const bookedSeats = new Set(busBookings.filter(b => b.paymentStatus !== "ONLINE").flatMap(b => b.selectedSeats));
      const onlineOverrides = new Set(busBookings.filter(b => b.paymentStatus === "ONLINE").flatMap(b => b.selectedSeats));

      // Calculate seats that are NOT available for online booking:
      // 1. Seats that have a booking (PAID, PENDING, BLOCKED, OFFLINE)
      // 2. Seats that are marked globally as isOnline: false or isPermanent: true
      let onlineAvailableCount = 0;
      
      // If bus has a defined seat layout, check each seat's flags
      if (bus.seats && bus.seats.length > 0) {
        bus.seats.forEach(seat => {
          const isBooked = bookedSeats.has(String(seat.seatNumber));
          const isGloballyUnavailable = seat.isOnline === false || seat.isPermanent === true;
          const isOverriddenOnline = onlineOverrides.has(String(seat.seatNumber));
          
          if (isOverriddenOnline) {
            // If explicitly set online for this date, it's available (unless booked by another PAID/PENDING booking)
            if (!isBooked) onlineAvailableCount++;
          } else if (!isBooked && !isGloballyUnavailable) {
            onlineAvailableCount++;
          }
        });
      } else {
        // Fallback for buses without explicit seat layouts yet
        onlineAvailableCount = Math.max(bus.totalSeats - bookedSeats.size, 0);
      }

      const seatsAvailable = onlineAvailableCount;

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
