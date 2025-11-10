import Conductor from "../models/conductorModel.js";

// ------------------------------------------------------
// Create a new conductor
// ------------------------------------------------------
export const createConductor = async (req, res) => {
  try {
    const { name, phone, email, assignedBusId, ownerId, status, role, password,agentCode } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
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
      agentCode,
    });

    const saved = await conductor.save();

    const conductorData = saved.toObject();
    delete conductorData.password;

    res.status(201).json(conductorData);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to add conductor" });
  }
};

// ------------------------------------------------------
// Get all conductors
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
// Get conductors by owner
// ------------------------------------------------------
export const getConductorsByOwner = async (req, res) => {
  try {
    const conductors = await Conductor.find({ ownerId: req.params.ownerId }).select("-password");
    res.status(200).json(conductors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------------------------------
// Get conductor by ID
// ------------------------------------------------------
export const getConductorById = async (req, res) => {
  try {
    const conductor = await Conductor.findById(req.params.id).select("-password");
    if (!conductor) return res.status(404).json({ message: "Conductor not found" });
    res.status(200).json(conductor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------------------------------
// Update conductor
// ------------------------------------------------------
export const updateConductor = async (req, res) => {
  try {
    const updateData = {};
    const fields = ["name", "phone", "email", "assignedBusId", "status", "role", "password"];

    fields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updateData[field] = req.body[field];
      }
    });

    const updated = await Conductor.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) return res.status(404).json({ message: "Conductor not found" });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update conductor" });
  }
};

// ------------------------------------------------------
// Delete conductor
// ------------------------------------------------------
export const deleteConductor = async (req, res) => {
  try {
    const deleted = await Conductor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Conductor not found" });
    res.status(200).json({ message: "Conductor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete conductor" });
  }
};

// ------------------------------------------------------
// Toggle active/inactive status
// ------------------------------------------------------
export const toggleConductorStatus = async (req, res) => {
  try {
    const conductor = await Conductor.findById(req.params.id);
    if (!conductor) return res.status(404).json({ message: "Conductor not found" });

    conductor.status = conductor.status === "active" ? "inactive" : "active";
    await conductor.save();

    const responseData = conductor.toObject();
    delete responseData.password;

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to toggle status" });
  }
};

// ------------------------------------------------------
// Login conductor
// ------------------------------------------------------
export const loginConductor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const conductor = await Conductor.findOne({ email });
    if (!conductor) return res.status(404).json({ message: "Conductor not found" });

    if (conductor.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const responseData = conductor.toObject();
    delete responseData.password;

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};
