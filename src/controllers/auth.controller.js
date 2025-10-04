const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signJwt } = require("../utils/jwt");

/**
 * POST /v1/auth/signup
 * body: { email, password, name?, avatarKey? }
 */
exports.signup = async (req, res, next) => {
  try {
    const { email, password, name, avatarKey } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ message: "email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    // Merge with current anon user if present
    let user = await User.findById(req.userId);
    if (!user) {
      user = new User();
    }
    user.email = email.toLowerCase();
    user.passwordHash = passwordHash;
    if (name) user.name = name;
    if (avatarKey) user.avatarKey = avatarKey;
    await user.save();

    const token = signJwt({ sub: user._id.toString() });
    res
      .status(201)
      .json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatarKey: user.avatarKey,
        },
      });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /v1/auth/login
 * body: { email, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash)
      return res.status(401).json({ message: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "invalid credentials" });

    // Optionally associate deviceId (if the request came via device flow first)
    if (req.deviceId && !user.deviceId) {
      user.deviceId = req.deviceId;
      await user.save();
    }

    const token = signJwt({ sub: user._id.toString() });
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarKey: user.avatarKey,
      },
    });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /v1/auth/anonymous
 * Creates/returns an anonymous token bound to current device user (from auth middleware).
 */
exports.anonymous = async (req, res, next) => {
  try {
    const token = signJwt({ sub: req.userId.toString() });
    // If server generated a new deviceId, surface it back
    const headers = {};
    if (req.deviceId) headers["x-device-id"] = req.deviceId;
    res.set(headers).json({ token });
  } catch (e) {
    next(e);
  }
};
