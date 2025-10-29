// controllers/searchController.js
import Route from "../models/routeModel.js";
import Bus from "../models/busModel.js";

/**
 * @desc Search for buses running between two points
 * @route GET /api/search/buses?from=Colombo&to=Kandy&date=2025-10-30
 */
export const searchBuses = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    // ✅ Validation
    if (!from || !to) {
      return res.status(400).json({
        message: "From and To locations are required",
      });
    }

    // Step 1: Get all active routes
    const routes = await Route.find({ status: "active" });

    // Step 2: Match routes containing both points in order
    const matchingRoutes = routes.filter((route) => {
      const allStops = [
        route.startPoint,
        ...(route.stops || []),
        route.endPoint,
      ].map((stop) => stop.trim().toLowerCase());

      const fromIndex = allStops.indexOf(from.trim().toLowerCase());
      const toIndex = allStops.indexOf(to.trim().toLowerCase());

      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });

    if (matchingRoutes.length === 0) {
      return res.json({ buses: [] });
    }

    // Step 3: Find buses for those routes
    const routeIds = matchingRoutes.map((r) => r._id.toString());

    const buses = await Bus.find({
      routeId: { $in: routeIds }, // ✅ routeId is string in Bus model
      status: "active",
    });

    if (buses.length === 0) {
      return res.json({ buses: [] });
    }

    // Step 4: Attach route info to each bus
    const results = buses.map((bus) => {
      const route = matchingRoutes.find(
        (r) => r._id.toString() === bus.routeId
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
        seatsAvailable: bus.totalSeats - (bus.bookedSeats?.length || 0),
        amenities: bus.amenities || [],
        status: bus.status,
      };
    });

    // Step 5: Return response
    return res.json({ buses: results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      message: "Failed to search buses",
      error: error.message,
    });
  }
};
  