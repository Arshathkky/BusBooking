import Bus from "../models/busModel.js";
import Route from "../models/routeModel.js";
import Conductor from "../models/conductorModel.js";

// --------------------


// Add a new bus (with ladies + conductor seats)
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
      conductorSeats = [], // 👈 Added field
      busNumber,
      seatLayout = "2x2",
      lastRowSeats= 4,
      useCustomLayout = false,
      seats = [], // 👈 Expecting full seat objects from designer
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

    let finalSeats = [];
    if (useCustomLayout && seats.length > 0) {
      finalSeats = seats.map(s => ({
        ...s,
        isOccupied: false,
        conductorAssigned: false,
        isOnline: s.isOnline ?? true
      }));
    } else {
      // ✅ Initialize seat layout with ladies + conductor seats
      finalSeats = Array.from({ length: totalSeats }, (_, i) => {
        const seatNumber = i + 1;
        const isLadiesOnly = ladiesOnlySeats.includes(seatNumber);

        const conductorSeat = conductorSeats.find((s) => s.seatNumber === seatNumber);
        const isConductorSeat = !!conductorSeat;

        return {
          seatNumber,
          isLadiesOnly,
          isOccupied: false,
          conductorAssigned: isConductorSeat,
          conductorCode: isConductorSeat ? conductorSeat.conductorCode : null,
          conductorId: isConductorSeat ? conductorSeat.conductorId || null : null,
          isOnline: true,
        };
      });
    }

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
      busNumber: busNumber || `BUS-${Date.now()}`,
      seatLayout,
      lastRowSeats,
      useCustomLayout,
      seats: finalSeats,
    });

    res.status(201).json({
      success: true,
      message: "Bus created successfully with ladies and conductor seats",
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

    // Validate busConfiguration if updated
    const allowedSeatLayouts = ["2x2", "2x3"];
      if (req.body.seatLayout && !allowedSeatLayouts.includes(req.body.seatLayout)) {
        return res.status(400).json({ success: false, message: "Invalid seat layout" });
      }

      if (req.body.lastRowSeats) {
        const val = Number(req.body.lastRowSeats);
        if (isNaN(val) || val < 1 || val > 10) {
          return res.status(400).json({ success: false, message: "lastRowSeats must be between 1 and 10" });
        }
      }

    // Selective update to avoid overwriting complex arrays like 'seats' or 'customSchedule' 
    // unless they are explicitly provided and validated.
    const { seats, ...updateData } = req.body;
    
    Object.assign(bus, updateData);
    
    // Only update seats if explicitly provided (usually via updateSeatLayout)
    if (seats && Array.isArray(seats)) {
        bus.seats = seats;
    }
    
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
      const seat = bus.seats.find((s) => String(s.seatNumber) === String(updatedSeat.seatNumber));
      if (!seat) continue;

      if (updatedSeat.isOccupied && seat.isOccupied) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seat.seatNumber} is already occupied`,
        });
      }

      seat.isOccupied = updatedSeat.isOccupied ?? seat.isOccupied;
      seat.isLadiesOnly = updatedSeat.isLadiesOnly ?? seat.isLadiesOnly;
      seat.conductorAssigned = updatedSeat.conductorAssigned ?? seat.conductorAssigned;
      seat.conductorCode = updatedSeat.conductorCode ?? seat.conductorCode;
      seat.conductorId = updatedSeat.conductorId ?? seat.conductorId;
      seat.isOnline = updatedSeat.isOnline ?? seat.isOnline;
      seat.isBlocked = updatedSeat.isBlocked ?? seat.isBlocked;
      seat.isPermanent = updatedSeat.isPermanent ?? seat.isPermanent;
      
      // Update coordinates for custom layouts
      if (updatedSeat.x !== undefined) seat.x = updatedSeat.x;
      if (updatedSeat.y !== undefined) seat.y = updatedSeat.y;
    }

    const { role } = req.body;
    if (role === 'conductor') {
        // Conductors save to pending seats
        bus.pendingSeats = bus.seats;
        bus.hasPendingChanges = true;
        // Don't actually update the main seats for conductors yet? 
        // Actually, if we want an approval system, we should NOT update bus.seats yet.
        // Let's refetch the ORIGINAL bus to discard the 'bus.seats' changes we just made in-memory
        const originalBus = await Bus.findById(req.params.id);
        originalBus.pendingSeats = bus.seats;
        originalBus.hasPendingChanges = true;
        await originalBus.save();
        return res.status(200).json({ success: true, message: "Changes requested. Waiting for owner approval." });
    }

    await bus.save();
    res.status(200).json({ success: true, message: "Seat layout updated", data: bus.seats });
  } catch (error) {
    console.error("Update Seat Layout Error:", error);
    res.status(500).json({ success: false, message: "Failed to update seat layout" });
  }
};

export const verifyConductorCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.json({ success: false, message: "Conductor code required" });
    }

    const conductor = await Conductor.findOne({ conductorCode: code });

    if (!conductor) {
      return res.json({ success: false, message: "Invalid conductor code" });
    }

    res.json({
      success: true,
      conductorId: conductor._id,
      conductorCode: conductor.conductorCode,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// --------------------
// Get all conductor-assigned seats
// --------------------
export const getConductorSeats = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    const conductorSeats = bus.seats.filter((s) => s.conductorAssigned);
    res.status(200).json({ success: true, data: conductorSeats });
  } catch (error) {
    console.error("Get Conductor Seats Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conductor seats" });
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



// ✅ PUT /api/buses/:id/conductor-seats
export const assignConductorSeats = async (req, res) => {
  try {
    const { conductorId, seatNumbers, markAsOccupied } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    // Get conductor details (for conductorCode)
    const conductor = await Conductor.findById(conductorId);
    if (!conductor) return res.status(404).json({ message: "Conductor not found" });

    bus.seats = bus.seats.map((seat) => {
      if (seatNumbers.map(String).includes(String(seat.seatNumber))) {
        return {
          ...seat.toObject(),
          conductorAssigned: true,
          conductorId,
          conductorCode: conductor.conductorCode,
          isOccupied: markAsOccupied, // Only mark if selected
          isReservedForConductor: !markAsOccupied,
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

// ✅ PATCH /api/buses/:id/conductor-seats/remove
export const removeConductorSeats = async (req, res) => {
  try {
    const { seatNumbers } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    bus.seats = bus.seats.map((seat) => {
      if (seatNumbers.map(String).includes(String(seat.seatNumber))) {
        return {
          ...seat.toObject(),
          conductorAssigned: false,
          conductorId: null,
          conductorCode: null,
          isOccupied: false,
          isReservedForConductor: false,
        };
      }
      return seat;
    });

    await bus.save();
    res.status(200).json({ message: "Conductor assignment removed", bus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove conductor assignment", error });
  }
};



export const getSeatLayout = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bus ID is required",
      });
    }

    // 2️⃣ Fetch bus
    const bus = await Bus.findById(id).select(
      "seats totalSeats name type price busNumber seatLayout lastRowSeats useCustomLayout"
    );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    // 5️⃣ Send response
    res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    console.error("❌ Get Seat Layout Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch seat layout",
    });
  }
};

// Removed updateOnlineSeatRange

// ✅ PUT /api/buses/:id/schedule
export const updateSchedule = async (req, res) => {
  console.log("📅 Updating schedule for bus:", req.params.id, "Data:", req.body);
  try {
    const { scheduleMode, weeklySchedule, customSchedule } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    // Validate schedule mode
    if (scheduleMode && !["weekly", "custom"].includes(scheduleMode)) {
      return res.status(400).json({ success: false, message: "Invalid schedule mode" });
    }

    // Validate custom schedule for duplicate dates
    if (customSchedule && Array.isArray(customSchedule)) {
      const dates = customSchedule.map(entry => entry.date);
      const uniqueDates = new Set(dates);
      if (dates.length !== uniqueDates.size) {
        return res.status(400).json({ 
          success: false, 
          message: "Duplicate dates found in custom schedule. Each date can only have one route assignment." 
        });
      }

      // Validate date format and future dates
      const today = new Date().toISOString().split('T')[0];
      for (const entry of customSchedule) {
        if (!entry.date || entry.date < today) {
          return res.status(400).json({ 
            success: false, 
            message: "All schedule dates must be today or in the future." 
          });
        }
      }
    }

    // Update schedule fields
    if (scheduleMode) bus.scheduleMode = scheduleMode;
    if (weeklySchedule) bus.weeklySchedule = weeklySchedule;
    if (customSchedule) bus.customSchedule = customSchedule;

    await bus.save();

    console.log("✅ Schedule saved successfully");
    res.status(200).json({ 
      success: true, 
      message: "Schedule updated", 
      data: {
        scheduleMode: bus.scheduleMode,
        weeklySchedule: bus.weeklySchedule,
        customSchedule: bus.customSchedule
      }
    });
  } catch (error) {
    console.error("❌ Schedule update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ PATCH /api/buses/:id/approve-changes
export const approvePendingChanges = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    if (!bus.hasPendingChanges) {
      return res.status(400).json({ success: false, message: "No pending changes to approve" });
    }

    // Apply pending seats to main seats
    bus.seats = bus.pendingSeats;
    bus.pendingSeats = [];
    bus.hasPendingChanges = false;
    
    await bus.save();
    res.status(200).json({ success: true, message: "Changes approved and applied", data: bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ PATCH /api/buses/:id/reject-changes
export const rejectPendingChanges = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    bus.pendingSeats = [];
    bus.hasPendingChanges = false;
    
    await bus.save();
    res.status(200).json({ success: true, message: "Changes rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};