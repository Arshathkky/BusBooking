import SeatRequest from "../models/seatRequestModel.js";
import Route from "../models/routeModel.js";
import Bus from "../models/busModel.js";
import Owner from "../models/ownerModel.js";
import { sendSMS } from "../utils/smsService.js";

// @desc    Create a new seat request
// @route   POST /api/seat-requests
// @access  Public
export const createSeatRequest = async (req, res) => {
  try {
    const { name, phone, from, to, date, seats, busType, time, busId, busName, ownerId, pickupPlace, comments } = req.body;

    if (!name || !phone || !from || !to || !date || !seats || !busType || !time) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }

    const normalizedFrom = from.trim();
    const normalizedTo = to.trim();

    // Identify which ownerIds to notify by checking routes and buses running from -> to
    const matchingRoutes = await Route.find({
      $or: [
        {
          startPoint: { $regex: new RegExp(`^${normalizedFrom}$`, "i") },
          endPoint: { $regex: new RegExp(`^${normalizedTo}$`, "i") },
        },
        { stops: { $all: [normalizedFrom, normalizedTo] } },
      ],
    });

    const routeIds = matchingRoutes.map((r) => r._id);
    const matchingBuses = await Bus.find({
      $or: [{ routeId: { $in: routeIds } }, ...(busId ? [{ _id: busId }] : [])],
    });

    const ownerIds = new Set();
    matchingRoutes.forEach((r) => {
      if (r.ownerId) ownerIds.add(String(r.ownerId));
    });
    matchingBuses.forEach((b) => {
      if (b.ownerId) ownerIds.add(String(b.ownerId));
    });
    if (ownerId) ownerIds.add(String(ownerId));

    const seatRequest = new SeatRequest({
      name,
      phone,
      from: normalizedFrom,
      to: normalizedTo,
      date,
      seats: Number(seats),
      busType,
      time,
      notifiedOwners: Array.from(ownerIds),
      busId: busId || undefined,
      busName: busName || undefined,
      pickupPlace: pickupPlace || undefined,
      comments: comments || undefined,
    });

    const savedRequest = await seatRequest.save();

    const ownerList = Array.from(ownerIds).filter(Boolean);
    if (ownerList.length > 0) {
      const owners = await Owner.find({ _id: { $in: ownerList } }).select("name phone");
      const smsMessage = `New seat request from ${name} for ${seats} seat(s) from ${normalizedFrom} to ${normalizedTo} on ${date} at ${time}. Contact: ${phone}`;

      await Promise.allSettled(
        owners
          .filter((owner) => owner.phone)
          .map((owner) => sendSMS(owner.phone, `${owner.name || "Bus owner"}, ${smsMessage}`))
      );
    }

    res.status(201).json({
      success: true,
      message: "Seat request submitted successfully. We will reply in 15 minutes.",
      data: savedRequest,
    });
  } catch (error) {
    console.error("Error creating seat request:", error);
    res.status(500).json({ success: false, message: "Server error creating seat request" });
  }
};

// @desc    Get all seat requests (Admin gets all, Owner gets matching requests)
// @route   GET /api/seat-requests
// @access  Private (Admin / Owner)
export const getSeatRequests = async (req, res) => {
  try {
    const { ownerId } = req.query;

    let filter = {};
    if (ownerId && ownerId !== "all") {
      // Owner only sees requests they are notified about
      filter = { notifiedOwners: ownerId };
    }

    const requests = await SeatRequest.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching seat requests:", error);
    res.status(500).json({ success: false, message: "Server error fetching seat requests" });
  }
};

// @desc    Update seat request status / response
// @route   PATCH /api/seat-requests/:id
// @access  Private (Admin / Owner)
export const updateSeatRequest = async (req, res) => {
  try {
    const { status, replyMessage } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const request = await SeatRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Seat request not found" });
    }

    request.status = status;
    if (replyMessage !== undefined) {
      request.replyMessage = replyMessage;
    }

    const updatedRequest = await request.save();

    res.status(200).json({
      success: true,
      message: "Seat request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating seat request:", error);
    res.status(500).json({ success: false, message: "Server error updating seat request" });
  }
};
