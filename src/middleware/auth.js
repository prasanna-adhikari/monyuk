const { nanoid } = require("nanoid");
const User = require("../models/User");
const { verifyJwt } = require("../utils/jwt");

/**
 * Strategy:
 * 1) If Authorization: Bearer <JWT> exists → verify → req.userId set.
 * 2) Else, if x-device-id header exists → find/create anonymous user → req.userId set.
 * 3) Else → create a new deviceId + user → set req.newDeviceId header in response.
 */
async function auth(req, res, next) {
  try {
    // Try JWT
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      try {
        const payload = verifyJwt(token);
        req.userId = payload.sub;
        return next();
      } catch (_) {
        /* fall through to device flow */
      }
    }

    // Device-based anonymous
    let deviceId = req.headers["x-device-id"];
    if (typeof deviceId !== "string" || !deviceId.trim()) {
      deviceId = nanoid();
      res.setHeader("x-device-id", deviceId); // let client persist
    }

    let user = await User.findOne({ deviceId });
    if (!user)
      user = await User.create({
        deviceId,
        name: "Friend",
        avatarKey: "boy",
        people: [],
      });

    req.userId = user._id;
    req.deviceId = deviceId;
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { auth };
