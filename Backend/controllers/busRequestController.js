import BusRequest from "../models/busRequestModel.js";

// @desc    Submit a new bus request (public)
// @route   POST /api/bus-requests
// @access  Public
export const createBusRequest = async (req, res) => {
  try {
    const { name, phone, pickupPlace, comments, busId, busName, ownerId, searchData } = req.body;

    if (!name || !phone || !pickupPlace || !busId || !busName || !searchData || !searchData.from || !searchData.to || !searchData.date) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const busRequest = await BusRequest.create({
      name,
      phone,
      pickupPlace,
      comments: comments || "",
      busId,
      busName,
      ownerId,
      searchData,
      status: "pending"
    });

    res.status(201).json({ success: true, data: busRequest });
  } catch (error) {
    console.error("Create Bus Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit request" });
  }
};

// @desc    Get all bus requests (admin, owner)
// @route   GET /api/bus-requests
// @access  Private
export const getBusRequests = async (req, res) => {
  try {
    let filter = {};

    // Filter requests by ownerId if user role is owner
    if (req.user && req.user.role === "owner") {
      filter.ownerId = req.user.id;
    } else if (req.user && req.user.role === "admin") {
      const { ownerId } = req.query;
      if (ownerId) {
        filter.ownerId = ownerId;
      }
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }

    const requests = await BusRequest.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error("Get Bus Requests Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
};

// @desc    Update bus request status (admin, owner)
// @route   PATCH /api/bus-requests/:id/status
// @access  Private
export const updateBusRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "processed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const busRequest = await BusRequest.findById(id);
    if (!busRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Double check owner permissions
    if (req.user && req.user.role === "owner" && String(busRequest.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this request" });
    }

    busRequest.status = status;
    await busRequest.save();

    res.status(200).json({ success: true, message: "Request status updated successfully", data: busRequest });
  } catch (error) {
    console.error("Update Bus Request Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

// @desc    Delete a bus request (admin, owner)
// @route   DELETE /api/bus-requests/:id
// @access  Private
export const deleteBusRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const busRequest = await BusRequest.findById(id);
    if (!busRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Double check owner permissions
    if (req.user && req.user.role === "owner" && String(busRequest.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this request" });
    }

    await BusRequest.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    console.error("Delete Bus Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete request" });
  }
};
