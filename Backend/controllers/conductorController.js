import Conductor from "../models/conductorModel.js";
import Bus from "../models/busModel.js";


// ------------------------------------------------------
// Create Conductor / Conductor
// ------------------------------------------------------
export const createConductor = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      assignedBusId,
      ownerId,
      status,
      role,
      password,
      conductorCode,
      city,
    } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Require conductor fields
    if (role === "conductor") {
      if (!conductorCode) {
        return res.status(400).json({ message: "Conductor Code is required" });
      }
      if (!city) {
        return res.status(400).json({ message: "City is required for conductor" });
      }
    }

    // Prevent duplicate conductorCode
    if (conductorCode) {
      const existing = await Conductor.findOne({ conductorCode });
      if (existing) {
        return res.status(400).json({ message: "Conductor Code already exists" });
      }
    }

    const conductor = new Conductor({
      name,
      phone,
      email,
      assignedBusId: assignedBusId || null,
      ownerId,
      status: status || "active",
      role: role || "conductor",
      password,
      conductorCode: role === "conductor" ? conductorCode : null,
      city: role === "conductor" ? city : null,
    });

    const saved = await conductor.save();

    const responseData = saved.toObject();
    delete responseData.password;

    res.status(201).json(responseData);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to add conductor" });
  }
};


// ------------------------------------------------------
// Get All Conductors
// ------------------------------------------------------
export const getAllConductors = async (req, res) => {
  try {
    const conductors = await Conductor.find().select("-password");
    res.status(200).json(conductors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------------------------------
// Get Unique Conductor Cities
// ------------------------------------------------------
export const getConductorCities = async (req, res) => {
  try {
    const cities = await Conductor.aggregate([
      { $match: { role: "conductor", city: { $ne: null } } },
      {
        $group: {
          _id: "$city",
          conductorCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          conductors: "$conductorCount",
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.status(200).json(cities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ------------------------------------------------------
// Get Conductors by Owner
// ------------------------------------------------------
export const getConductorsByOwner = async (req, res) => {
  try {
    const conductors = await Conductor.find({
      ownerId: req.params.ownerId,
    }).select("-password");

    res.status(200).json(conductors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ------------------------------------------------------
// Get Conductor by ID
// ------------------------------------------------------
export const getConductorById = async (req, res) => {
  try {
    const conductor = await Conductor.findById(req.params.id).select("-password");
    if (!conductor) {
      return res.status(404).json({ message: "Conductor not found" });
    }
    res.status(200).json(conductor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ------------------------------------------------------
// Update Conductor
// ------------------------------------------------------
export const updateConductor = async (req, res) => {
  try {
    const updateData = {};
    const fields = [
      "name",
      "phone",
      "email",
      "assignedBusId",
      "status",
      "role",
      "password",
      "conductorCode",
      "city",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updateData[field] = req.body[field];
      }
    });

    // If role updated to conductor → require conductor fields
    if (updateData.role === "conductor") {
      if (!updateData.conductorCode) {
        return res.status(400).json({ message: "Conductor Code is required" });
      }
      if (!updateData.city) {
        return res.status(400).json({ message: "City is required for conductor" });
      }
    }

    const updated = await Conductor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Conductor not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update conductor" });
  }
};


// ------------------------------------------------------
// Delete Conductor
// ------------------------------------------------------
export const deleteConductor = async (req, res) => {
  try {
    const deleted = await Conductor.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Conductor not found" });
    }
    res.status(200).json({ message: "Conductor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete conductor" });
  }
};


// ------------------------------------------------------
// Toggle Status
// ------------------------------------------------------
export const toggleConductorStatus = async (req, res) => {
  try {
    const conductor = await Conductor.findById(req.params.id);
    if (!conductor) {
      return res.status(404).json({ message: "Conductor not found" });
    }

    conductor.status =
      conductor.status === "active" ? "inactive" : "active";

    await conductor.save();

    const responseData = conductor.toObject();
    delete responseData.password;

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ------------------------------------------------------
// Login Conductor / Conductor
// ------------------------------------------------------
export const loginConductor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const conductor = await Conductor.findOne({ email });

    if (!conductor) {
      return res.status(404).json({ message: "User not found" });
    }

    if (conductor.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (conductor.status !== "active") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const responseData = conductor.toObject();
    delete responseData.password;

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// ------------------------------------------------------
// Get Conductor Assigned Bus


// -------------------- Get Bus assigned to a conductor --------------------
export const getConductorBus = async (req, res) => {
  try {
    const conductorId = req.params.id;

    const conductor = await Conductor.findById(conductorId);
    if (!conductor) {
      return res.status(404).json({ message: "Conductor not found" });
    }

    if (!conductor.assignedBusId) {
      return res.status(200).json({ bus: null });
    }

    // ✅ Fetch the real bus from the database
    const bus = await Bus.findById(conductor.assignedBusId);
    if (!bus) {
      return res.status(200).json({ bus: null });
    }

    res.status(200).json({ bus });
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : "Server error" });
  }
};

// -------------------- Get seats assigned to conductor --------------------
export const getConductorSeats = async (req, res) => {
  try {
    const conductorId = req.query.conductorId;

    const conductor = await Conductor.findById(conductorId);
    if (!conductor || !conductor.assignedBusId) {
      return res.status(200).json({ assignedSeats: [] });
    }

    // ✅ Read embedded seats from the bus document
    const bus = await Bus.findById(conductor.assignedBusId);
    if (!bus) return res.status(200).json({ assignedSeats: [] });

    const assignedSeats = bus.seats
      .filter((s) => s.conductorId === conductorId.toString())
      .map((s) => s.seatNumber);

    res.status(200).json({ assignedSeats });
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : "Server error" });
  }
};

// -------------------- Conductor Dashboard (bus + seats) --------------------
// GET /api/conductor/dashboard/:conductorId
export const getConductorDashboard = async (req, res) => {
  try {
    const { conductorId } = req.params;

    if (!conductorId) return res.status(400).json({ message: "Conductor ID not found" });

    const conductor = await Conductor.findById(conductorId);

    if (!conductor) return res.status(404).json({ message: "Conductor not found" });

    if (!conductor.assignedBusId) {
      return res.status(404).json({ message: "No bus assigned" });
    }

    const bus = await Bus.findById(conductor.assignedBusId);

    if (!bus) {
      return res.status(404).json({ message: "Assigned bus not found" });
    }

    const assignedSeats = bus.seats
      .filter(s => s.conductorId === conductorId.toString() && !s.isOccupied)
      .map(s => s.seatNumber);

    res.json({
      bus: {
        name: bus.name,
        busNumber: bus.busNumber,
        route: bus.route,
        departureTime: bus.departureTime,
      },
      assignedSeats: seatNumbers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard" });
  }
};