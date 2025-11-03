import Bus from "../models/busModel.js";
import Route from "../models/routeModel.js";

// --------------------
// Add a new bus
// --------------------
export const addBus = async (req, res) => {
  try {
    const {
      name,
      companyName,
      type,
      departureTime,
      arrivalTime,
      duration,
      totalSeats,
      price,
      routeId,
      startPoint,
      endPoint,
      stops = [],
      amenities = [],
      ownerId,
      isSpecial = false,
      specialTime,
      ladiesOnlySeats = [],
    } = req.body;

    // ✅ Validate required fields
    if (!name || !companyName || !type || (!routeId && (!startPoint || !endPoint))) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let route;

    // ✅ Find or create route
    if (routeId) {
      route = await Route.findById(routeId);
      if (!route) return res.status(404).json({ message: "Route not found" });
    } else {
      const start = startPoint?.trim();
      const end = endPoint?.trim();

      route = await Route.findOne({ startPoint: start, endPoint: end, status: "active" });

      if (!route) {
        route = await Route.create({
          name: `${start}-${end}`,
          startPoint: start,
          endPoint: end,
          stops,
          distance: 0,
          duration,
          ownerId,
          status: "active",
        });
      }
    }

    // ✅ Initialize seats
    const seats = Array.from({ length: totalSeats }, (_, i) => ({
      seatNumber: i + 1,
      isLadiesOnly: ladiesOnlySeats.includes(i + 1),
      isOccupied: false,
    }));

    // ✅ Create Bus
    const bus = await Bus.create({
      name,
      companyName,
      type,
      departureTime,
      arrivalTime,
      duration,
      totalSeats,
      price,
      routeId: route._id.toString(),
      amenities,
      isSpecial,
      specialTime,
      ladiesOnlySeats,
      ownerId,
      seats,
      status: "active",
    });

    res.status(201).json(bus);
  } catch (error) {
    console.error("Add Bus Error:", error);
    res.status(500).json({ message: error.message || "Failed to create bus" });
  }
};

// --------------------
// Get all buses
// --------------------
export const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.status(200).json(buses);
  } catch (error) {
    console.error("Get Buses Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch buses" });
  }
};

// --------------------
// Get single bus by ID
// --------------------
export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    res.status(200).json(bus);
  } catch (error) {
    console.error("Get Bus Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch bus" });
  }
};

// --------------------
// Update bus
// --------------------
export const updateBus = async (req, res) => {
  try {
    const updated = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Bus not found" });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Bus Error:", error);
    res.status(400).json({ message: error.message || "Failed to update bus" });
  }
};

// --------------------
// Update seat layout only
// --------------------
export const updateSeatLayout = async (req, res) => {
  try {
    const { seats } = req.body;
    if (!Array.isArray(seats)) {
      return res.status(400).json({ message: "Seats must be an array" });
    }

    // ✅ Validate seat structure
    const validSeats = seats.every(
      (s) =>
        typeof s.seatNumber === "number" &&
        typeof s.isLadiesOnly === "boolean" &&
        typeof s.isOccupied === "boolean"
    );

    if (!validSeats) {
      return res.status(400).json({ message: "Invalid seat structure" });
    }

    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    bus.seats = seats;
    const updated = await bus.save();

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Seat Layout Error:", error);
    res.status(500).json({ message: error.message || "Failed to update seat layout" });
  }
};

// --------------------
// Delete bus
// --------------------
export const deleteBus = async (req, res) => {
  try {
    const deleted = await Bus.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Bus not found" });

    res.status(200).json({ message: "Bus deleted successfully" });
  } catch (error) {
    console.error("Delete Bus Error:", error);
    res.status(500).json({ message: error.message || "Failed to delete bus" });
  }
};

// --------------------
// Toggle bus status
// --------------------
export const toggleBusStatus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    bus.status = bus.status === "active" ? "inactive" : "active";
    const updated = await bus.save();

    res.status(200).json(updated);
  } catch (error) {
    console.error("Toggle Bus Status Error:", error);
    res.status(500).json({ message: error.message || "Failed to toggle bus status" });
  }
};

// --------------------
// Fetch only seat layout (optional endpoint for frontend)
// --------------------
export const getSeatLayout = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).select("seats totalSeats name type price");
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    res.status(200).json(bus);
  } catch (error) {
    console.error("Get Seat Layout Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch seat layout" });
  }
};
