import mongoose from "mongoose";
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
    const payload = req.body || {};
    const searchData = payload.searchData || {};

    const name = payload.name || "";
    const phone = payload.phone || "";
    const from = (payload.from || searchData.from || "").toString().trim();
    const to = (payload.to || searchData.to || "").toString().trim();
    const date = (payload.date || searchData.date || "").toString().trim();
    const seatCount = Number(payload.seats ?? searchData.passengers ?? 1);
    const busType = (payload.busType || searchData.busType || "Any").toString().trim();
    const time = (payload.time || searchData.time || "Requested").toString().trim();
    const busId = payload.busId || searchData.busId || undefined;
    const busName = payload.busName || searchData.busName || undefined;
    const ownerId = payload.ownerId || searchData.ownerId || undefined;
    const pickupPlace = payload.pickupPlace || payload.pickupPlace || undefined;
    const comments = payload.comments || undefined;

    if (!name || !phone || !from || !to || !date || !seatCount || !busType || !time) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }

    const slPhoneRegex = /^(?:\+94|94|0)?7[0-9]{8}$/;
    if (!slPhoneRegex.test(phone.toString().trim())) {
      return res.status(400).json({ success: false, message: "Please provide a valid Sri Lankan phone number (e.g. 07XXXXXXXX)" });
    }

    // Identify which ownerIds to notify by checking routes and buses running from -> to
    const matchingRoutes = await Route.find({
      $or: [
        {
          startPoint: { $regex: new RegExp(`^${from}$`, "i") },
          endPoint: { $regex: new RegExp(`^${to}$`, "i") },
        },
        { stops: { $all: [from, to] } },
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
      from,
      to,
      date,
      seats: seatCount,
      busType,
      time,
      notifiedOwners: Array.from(ownerIds),
      ownerId: ownerId || undefined,
      busId: busId || undefined,
      busName: busName || undefined,
      pickupPlace: pickupPlace || undefined,
      comments: comments || undefined,
    });

    const savedRequest = await seatRequest.save();

    const ownerList = Array.from(ownerIds)
      .filter(Boolean)
      .map((id) => String(id))
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const ownerPhonesToNotify = [];

    if (ownerList.length > 0) {
      const owners = await Owner.find({ _id: { $in: ownerList } }).select("name phone");
      owners.forEach((owner) => {
        if (owner.phone) ownerPhonesToNotify.push({ name: owner.name, phone: owner.phone });
      });
    }

    if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
      const owner = await Owner.findById(ownerId).select("name phone");
      if (owner?.phone && !ownerPhonesToNotify.some((entry) => entry.phone === owner.phone)) {
        ownerPhonesToNotify.push({ name: owner.name, phone: owner.phone });
      }
    }

    if (busId && ownerPhonesToNotify.length === 0) {
      const busRecord = await Bus.findById(busId).select("ownerPhoneForSMS ownerId");
      if (busRecord?.ownerPhoneForSMS) {
        ownerPhonesToNotify.push({ name: busName || "Bus owner", phone: busRecord.ownerPhoneForSMS });
      }
    }

    if (ownerPhonesToNotify.length > 0) {
      const smsMessage = `New seat request from ${name} for ${seatCount} seat(s) from ${from} to ${to} on ${date} at ${time}. Contact: ${phone}`;

      await Promise.allSettled(
        ownerPhonesToNotify.map((owner) => sendSMS(owner.phone, `${owner.name || "Bus owner"}, ${smsMessage}`))
      );
    }

    res.status(201).json({
      success: true,
      message: "Seat request submitted successfully. We will reply in 15 minutes.",
      data: savedRequest,
    });
  } catch (error) {
    console.error("Error creating seat request:", error);
    res.status(500).json({ success: false, message: error.message || "Server error creating seat request" });
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
      filter = {
        $or: [
          { notifiedOwners: ownerId },
          { ownerId: String(ownerId) },
          { notifiedOwners: { $exists: true, $size: 0 } },
        ],
      };
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

    // Send SMS notification to the passenger if approved or rejected
    if (status === "approved" || status === "rejected") {
      const statusText = status.toUpperCase();
      const replyPart = replyMessage ? ` Reply: ${replyMessage}` : "";
      const smsMessage = `TouchMe+: Your seat request from ${request.from} to ${request.to} on ${request.date} is ${statusText}.${replyPart}`;
      
      sendSMS(request.phone, smsMessage).catch((smsErr) => {
        console.error("Failed to send status update SMS to passenger:", smsErr);
      });
    }

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
