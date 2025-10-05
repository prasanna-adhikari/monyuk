// src/middleware/bootstrapAuth.js
const { Types } = require("mongoose");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

module.exports = async function bootstrapAuth(req, res, next) {
  try {
    // 1) JWT path optional — if you don't have JWT, skip
    // (leave room to plug in later; no-op for now)

    // 2) DeviceId path
    let deviceId = req.headers["x-device-id"] || req.cookies?.deviceId;
    if (typeof deviceId !== "string" || !deviceId.trim()) {
      deviceId = uuidv4();
      // Not httpOnly so RN/web can also read it if needed
      res.cookie("deviceId", deviceId, {
        sameSite: "lax",
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
    }

    let user = await User.findOne({ deviceId });
    if (!user) user = await User.create({ deviceId }); // anonymous shell user

    req.userId = user._id.toString();
    req.deviceId = deviceId;
    res.set("x-device-id", deviceId);

    next();
  } catch (err) {
    next(err);
  }
};
