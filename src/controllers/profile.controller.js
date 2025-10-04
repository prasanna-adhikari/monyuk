const User = require("../models/User");

/**
 * GET /v1/profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const u = await User.findById(req.userId);
    if (!u) return res.status(404).json({ message: "user not found" });
    const body = {
      id: u._id,
      name: u.name || "Friend",
      avatarKey: u.avatarKey || "boy",
      people: u.people || [],
      email: u.email || null,
    };
    // surface device id if middleware created one
    const headers = {};
    if (req.deviceId) headers["x-device-id"] = req.deviceId;
    res.set(headers).json(body);
  } catch (e) {
    next(e);
  }
};

/**
 * PUT /v1/profile
 * body: { name?, avatarKey?, people? }
 */
exports.putProfile = async (req, res, next) => {
  try {
    const { name, avatarKey, people } = req.body || {};
    const u = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(name !== undefined && { name }),
        ...(avatarKey !== undefined && { avatarKey }),
        ...(people !== undefined && { people }),
      },
      { new: true }
    );
    if (!u) return res.status(404).json({ message: "user not found" });
    res.json({
      id: u._id,
      name: u.name,
      avatarKey: u.avatarKey,
      people: u.people,
      email: u.email || null,
    });
  } catch (e) {
    next(e);
  }
};
