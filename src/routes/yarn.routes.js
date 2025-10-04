// src/routes/yarn.routes.js
const router = require("express").Router();
const { chatLimiter } = require("../middleware/rateLimit");
const ctrl = require("../controllers/yarn.controller");
router.post("/message", chatLimiter, ctrl.postMessage);
module.exports = router;

// src/controllers/yarn.controller.js
const { sendAndStore } = require("../services/chat.service");
exports.postMessage = async (req, res, next) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== "string")
      return res.status(400).json({ message: "text required" });
    const { reply, risk } = await sendAndStore({
      userId: req.userId,
      input: text,
    });
    // Surface new device id to client once
    const headers = {};
    if (req.newDeviceId) headers["x-device-id"] = req.newDeviceId;
    res.set(headers).json({ reply, risk });
  } catch (e) {
    next(e);
  }
};
