import Conductor from "../models/conductorModel.js";


// ------------------------------------------------------
// Create Conductor / Agent
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
      agentCode,
      city,
    } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Require agent fields
    if (role === "agent") {
      if (!agentCode) {
        return res.status(400).json({ message: "Agent Code is required" });
      }
      if (!city) {
        return res.status(400).json({ message: "City is required for agent" });
      }
    }

    // Prevent duplicate agentCode
    if (agentCode) {
      const existing = await Conductor.findOne({ agentCode });
      if (existing) {
        return res.status(400).json({ message: "Agent Code already exists" });
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
      agentCode: role === "agent" ? agentCode : null,
      city: role === "agent" ? city : null,
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
// Get Unique Agent Cities
// ------------------------------------------------------
export const getAgentCities = async (req, res) => {
  try {
    const cities = await Conductor.aggregate([
      { $match: { role: "agent", city: { $ne: null } } },
      {
        $group: {
          _id: "$city",
          agentCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          agents: "$agentCount",
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
      "agentCode",
      "city",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updateData[field] = req.body[field];
      }
    });

    // If role updated to agent → require agent fields
    if (updateData.role === "agent") {
      if (!updateData.agentCode) {
        return res.status(400).json({ message: "Agent Code is required" });
      }
      if (!updateData.city) {
        return res.status(400).json({ message: "City is required for agent" });
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
// Login Conductor / Agent
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