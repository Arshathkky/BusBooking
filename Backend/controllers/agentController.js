import Conductor from "../models/conductorModel.js";

export const verifyAgentCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Agent code is required",
      });
    }

    const agent = await Conductor.findOne({
      agentCode: code,
      role: "agent",
      status: "active",
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive agent code",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Agent verified successfully",
      agent: {
        _id: agent._id,
        name: agent.name,
        agentCode: agent.agentCode,
        assignedBusId: agent.assignedBusId,
        city: agent.city,
      },
    });
  } catch (error) {
    console.error("Agent verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};