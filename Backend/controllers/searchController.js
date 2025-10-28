import Route from "../models/routeModel.js";
import Bus from "../models/busModel.js";

/**
 * @desc Search for buses that run between two locations
 * @route GET /api/search/buses?from=Colombo&to=Kandy&date=2025-10-28
 */
export const searchBuses = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "From and To locations are required" });
    }

    // ✅ Find routes that include both start and stop points
    const routes = await Route.find({ status: "active" });
    const matchingRoutes = routes.filter((route) => {
      const allStops = [route.startPoint, ...(route.stops || []), route.endPoint];
      const fromIndex = allStops.findIndex(
        (p) => p.toLowerCase() === from.toLowerCase()
      );
      const toIndex = allStops.findIndex(
        (p) => p.toLowerCase() === to.toLowerCase()
      );
      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });

    if (matchingRoutes.length === 0) {
      return res.json([]);
    }

    // ✅ Fetch buses that use any of those routes
    const routeIds = matchingRoutes.map((r) => r._id.toString());
    const buses = await Bus.find({ routeId: { $in: routeIds }, status: "active" });

    // ✅ Combine route info with bus details
    const results = buses.map((bus) => {
      const route = matchingRoutes.find((r) => r._id.toString() === bus.routeId);
      return {
        ...bus.toObject(),
        routeName: route?.name,
        startPoint: route?.startPoint,
        endPoint: route?.endPoint,
        stops: route?.stops,
      };
    });

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Failed to search buses", error: error.message });
  }
};
