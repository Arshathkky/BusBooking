import Conductor from "../models/conductorModel.js";

// ✅ Create a new conductor
export const createConductor = async (req, res) => {
  try {
    const conductor = new Conductor(req.body);
    const savedConductor = await conductor.save();
    res.status(201).json(savedConductor);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to add conductor" });
  }
};

export const getAllConductors = async (req, res) => {
  try {
    const conductors = await Conductor.find();
    res.status(200).json(conductors);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch conductors" });
  }
};


// ✅ Get all conductors for a specific owner
export const getConductorsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const conductors = await Conductor.find({ ownerId });
    res.status(200).json(conductors);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch conductors" });
  }
};

// ✅ Get single conductor by ID
export const getConductorById = async (req, res) => {
  try {
    const conductor = await Conductor.findById(req.params.id);
    if (!conductor) return res.status(404).json({ message: "Conductor not found" });
    res.status(200).json(conductor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update conductor
export const updateConductor = async (req, res) => {
  try {
    const updated = await Conductor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Conductor not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update conductor" });
  }
};

// ✅ Delete conductor
export const deleteConductor = async (req, res) => {
  try {
    const deleted = await Conductor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Conductor not found" });
    res.status(200).json({ message: "Conductor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete conductor" });
  }
};

// ✅ Toggle status (active/inactive)
export const toggleConductorStatus = async (req, res) => {
  try {
    const conductor = await Conductor.findById(req.params.id);
    if (!conductor) return res.status(404).json({ message: "Conductor not found" });

    conductor.status = conductor.status === "active" ? "inactive" : "active";
    const updated = await conductor.save();

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to toggle status" });
  }
};
