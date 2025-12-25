import Bus from "../models/busModel.js";
import Route from "../models/routeModel.js";
import Conductor from "../models/conductorModel.js";


// --------------------
// Add a new bus (with ladies + agent seats)
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
      specialTime = null,
      ladiesOnlySeats = [],
      agentSeats = [], // 👈 Added field
      busNumber,
    } = req.body;

    // ✅ Validate required fields
    if (!name || !companyName || !type || !ownerId || !totalSeats || !price) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // ✅ Validate busNumber uniqueness
    if (busNumber) {
      const existing = await Bus.findOne({ busNumber });
      if (existing) {
        return res.status(400).json({ success: false, message: "Bus number already exists" });
      }
    }

    // ✅ Route handling (find or create)
    let route;
    if (routeId) {
      route = await Route.findById(routeId);
      if (!route) return res.status(404).json({ success: false, message: "Route not found" });
    } else {
      const start = startPoint?.trim();
      const end = endPoint?.trim();

      if (!start || !end)
        return res.status(400).json({ success: false, message: "Start and end points are required" });

      route =
        (await Route.findOne({ startPoint: start, endPoint: end, status: "active" })) ||
        (await Route.create({
          name: `${start}-${end}`,
          startPoint: start,
          endPoint: end,
          stops,
          distance: 0,
          duration,
          ownerId,
          status: "active",
        }));
    }

    // ✅ Initialize seat layout with ladies + agent seats
    const seats = Array.from({ length: totalSeats }, (_, i) => {
      const seatNumber = i + 1;
      const isLadiesOnly = ladiesOnlySeats.includes(seatNumber);

      const agentSeat = agentSeats.find((s) => s.seatNumber === seatNumber);
      const isAgentSeat = !!agentSeat;

      return {
        seatNumber,
        isLadiesOnly,
        isOccupied: false,
        agentAssigned: isAgentSeat,
        agentCode: isAgentSeat ? agentSeat.agentCode : null,
        agentId: isAgentSeat ? agentSeat.agentId || null : null,
      };
    });

    // ✅ Create new bus
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
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      stops,
      amenities,
      isSpecial,
      specialTime,
      ladiesOnlySeats,
      ownerId,
      seats,
      status: "active",
      busNumber: busNumber || `BUS-${Date.now()}`,
    });

    res.status(201).json({
      success: true,
      message: "Bus created successfully with ladies and agent seats",
      data: bus,
    });
  } catch (error) {
    console.error("Add Bus Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create bus",
    });
  }
};

// --------------------
// Get all buses
// --------------------
export const getBuses = async (req, res) => {
  try {
    const { ownerId } = req.query;
    const filter = ownerId ? { ownerId } : {};
    const buses = await Bus.find(filter).populate("routeId");

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    console.error("Get Buses Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch buses" });
  }
};

// --------------------
// Get single bus by ID
// --------------------
export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate("routeId");
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    res.status(200).json({ success: true, data: bus });
  } catch (error) {
    console.error("Get Bus Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bus" });
  }
};

// --------------------
// Update bus details
// --------------------
export const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    Object.assign(bus, req.body);
    await bus.save();

    res.status(200).json({
      success: true,
      message: "Bus updated successfully",
      data: bus,
    });
  } catch (error) {
    console.error("Update Bus Error:", error);
    res.status(400).json({ success: false, message: "Failed to update bus" });
  }
};

// --------------------
// Update seat layout (manual edit)
// --------------------
export const updateSeatLayout = async (req, res) => {
  try {
    const { seats } = req.body;
    if (!Array.isArray(seats)) {
      return res.status(400).json({ success: false, message: "Seats must be an array" });
    }

    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    for (let updatedSeat of seats) {
      const seat = bus.seats.find((s) => s.seatNumber === updatedSeat.seatNumber);
      if (!seat) continue;

      if (updatedSeat.isOccupied && seat.isOccupied) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seat.seatNumber} is already occupied`,
        });
      }

      seat.isOccupied = updatedSeat.isOccupied ?? seat.isOccupied;
      seat.isLadiesOnly = updatedSeat.isLadiesOnly ?? seat.isLadiesOnly;
      seat.agentAssigned = updatedSeat.agentAssigned ?? seat.agentAssigned;
      seat.agentCode = updatedSeat.agentCode ?? seat.agentCode;
      seat.agentId = updatedSeat.agentId ?? seat.agentId;
    }

    await bus.save();
    res.status(200).json({ success: true, message: "Seat layout updated", data: bus.seats });
  } catch (error) {
    console.error("Update Seat Layout Error:", error);
    res.status(500).json({ success: false, message: "Failed to update seat layout" });
  }
};

export const verifyAgentCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.json({ success: false, message: "Agent code required" });
    }

    const agent = await Conductor.findOne({ agentCode: code });

    if (!agent) {
      return res.json({ success: false, message: "Invalid agent code" });
    }

    res.json({
      success: true,
      agentId: agent._id,
      agentCode: agent.agentCode,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// --------------------
// Get all agent-assigned seats
// --------------------
export const getAgentSeats = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    const agentSeats = bus.seats.filter((s) => s.agentAssigned);
    res.status(200).json({ success: true, data: agentSeats });
  } catch (error) {
    console.error("Get Agent Seats Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch agent seats" });
  }
};

// --------------------
// Delete bus
// --------------------
export const deleteBus = async (req, res) => {
  try {
    const deleted = await Bus.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Bus not found" });

    res.status(200).json({ success: true, message: "Bus deleted successfully" });
  } catch (error) {
    console.error("Delete Bus Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete bus" });
  }
};

// --------------------
// Toggle bus status
// --------------------
export const toggleBusStatus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    bus.status = bus.status === "active" ? "inactive" : "active";
    await bus.save();

    res.status(200).json({
      success: true,
      message: `Bus status changed to ${bus.status}`,
      data: bus,
    });
  } catch (error) {
    console.error("Toggle Bus Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle bus status" });
  }
};

// --------------------
// Get seat layout (frontend use)
// --------------------



// ✅ PUT /api/buses/:id/agent-seats
export const assignAgentSeats = async (req, res) => {
  try {
    const { agentId, seatNumbers, markAsOccupied } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    // Get agent details (for agentCode)
    const agent = await Conductor.findById(agentId);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    bus.seats = bus.seats.map((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        return {
          ...seat.toObject(),
          agentAssigned: true,
          agentId,
          agentCode: agent.agentCode,
          isOccupied: markAsOccupied, // Only mark if selected
          isReservedForAgent: !markAsOccupied,
        };
      }
      return seat;
    });

    await bus.save();
    res.status(200).json({ message: "Seats assigned successfully", bus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to assign seats", error });
  }
};

// ✅ PATCH /api/buses/:id/agent-seats/remove
export const removeAgentSeats = async (req, res) => {
  try {
    const { seatNumbers } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    bus.seats = bus.seats.map((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        return {
          ...seat.toObject(),
          agentAssigned: false,
          agentId: null,
          agentCode: null,
          isOccupied: false,
          isReservedForAgent: false,
        };
      }
      return seat;
    });

    await bus.save();
    res.status(200).json({ message: "Agent assignment removed", bus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove agent assignment", error });
  }
};


// ✅ Hold seats temporarily for 10 minutes
export const holdSeats = async (req, res) => {
  try {
    const { busId, seatNumbers, sessionId } = req.body; // sessionId = unique per user
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    const now = new Date();
    const holdExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 min from now

    bus.seats = bus.seats.map((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        if (seat.isOccupied || seat.isHeld) {
          throw new Error(`Seat ${seat.seatNumber} is already occupied/held`);
        }
        return {
          ...seat.toObject(),
          isHeld: true,
          heldBy: sessionId,
          holdExpiresAt,
        };
      }
      return seat;
    });

    await bus.save();
    res.status(200).json({ success: true, message: "Seats held", bus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Release expired holds (call before fetching seats)
export const releaseExpiredHolds = async (bus) => {
  const now = new Date();
  bus.seats = bus.seats.map((seat) => {
    if (seat.isHeld && seat.holdExpiresAt && new Date(seat.holdExpiresAt) <= now) {
      return {
        ...seat.toObject(),
        isHeld: false,
        heldBy: null,
        holdExpiresAt: null,
      };
    }
    return seat;
  });
  await bus.save();
};
export const getSeatLayout = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).select("seats totalSeats name type price busNumber");
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    // Release expired holds before sending to frontend
    await releaseExpiredHolds(bus);

    res.status(200).json({ success: true, data: bus });
  } catch (error) {
    console.error("Get Seat Layout Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch seat layout" });
  }
};
