import Route from "../models/routeModel.js";

// ✅ Get all routes (filtered by owner if provided)
export const getRoutes = async (req, res) => {
  try {
    const { ownerId } = req.query;
    const filter = ownerId ? { ownerId } : {};
    const routes = await Route.find(filter).sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch routes", error: error.message });
  }
};

// ✅ Get route by ID
export const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch route", error: error.message });
  }
};

// ✅ Create a new route
export const createRoute = async (req, res) => {
  try {
    const { name, startPoint, endPoint, stops, distance, duration, status, ownerId } = req.body;

    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const newRoute = new Route({
      name,
      startPoint,
      endPoint,
      stops,
      distance,
      duration,
      status: status || "active",
      ownerId,
    });

    const savedRoute = await newRoute.save();
    res.status(201).json(savedRoute);
  } catch (error) {
    res.status(400).json({ message: "Failed to create route", error: error.message });
  }
};

// ✅ Update route
export const updateRoute = async (req, res) => {
  try {
    const updatedRoute = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRoute) return res.status(404).json({ message: "Route not found" });
    res.json(updatedRoute);
  } catch (error) {
    res.status(400).json({ message: "Failed to update route", error: error.message });
  }
};

// ✅ Delete route
export const deleteRoute = async (req, res) => {
  try {
    const deletedRoute = await Route.findByIdAndDelete(req.params.id);
    if (!deletedRoute) return res.status(404).json({ message: "Route not found" });
    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete route", error: error.message });
  }
};

// ✅ Toggle active/inactive
export const toggleRouteStatus = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });

    route.status = route.status === "active" ? "inactive" : "active";
    await route.save();
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle status", error: error.message });
  }
};

// ✅ Search routes by pickup/drop (includes stops)
export const searchRoutes = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "From and To are required" });
    }

    const routes = await Route.find({ status: "active" });

    // Check if route passes through both from and to in correct order
    const filtered = routes.filter((route) => {
      const allPoints = [route.startPoint, ...(route.stops || []), route.endPoint];
      const fromIndex = allPoints.findIndex((p) => p.toLowerCase() === from.toLowerCase());
      const toIndex = allPoints.findIndex((p) => p.toLowerCase() === to.toLowerCase());
      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Failed to search routes", error: error.message });
  }
};
