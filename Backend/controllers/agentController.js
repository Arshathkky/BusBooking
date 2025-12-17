import Conductor from "../models/conductorModel.js";

export const verifyAgentCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.json({ success: false, message: "Agent code required" });
    }

    const agent = await Conductor.findOne({ agentCode: code });

    if (!agent) {
      return res.json({ success: false, message: "Invalid agent code" });
    }

    res.json({
      success: true,
      agentId: agent._id,
      agentCode: agent.agentCode,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};
