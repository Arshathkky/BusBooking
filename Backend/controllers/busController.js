import Bus from "../models/busModel.js";

// Add new bus
export const addBus = async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json({ message: "Bus added successfully", bus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all buses
export const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bus by ID
export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update seat layout
export const updateSeatLayout = async (req, res) => {
  try {
    const { seats } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    bus.seats = seats;
    bus.ladiesOnlySeats = seats
      .filter((s) => s.isLadiesOnly)
      .map((s) => s.seatNumber);

    await bus.save();
    res.json({ message: "Seat layout updated", bus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }
    res.json({ message: "Bus deleted successfully" });
  } catch (error) {
    console.error("Error deleting bus:", error);
    res.status(500).json({ message: "Error deleting bus" });
  }
};

