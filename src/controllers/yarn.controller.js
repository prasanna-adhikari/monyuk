// src/controllers/yarn.controller.js
const { Types } = require("mongoose");
const YarnMessage = require("../models/YarnMessage");
const User = require("../models/User");
const { chatOnce } = require("../services/gemini");
const { v4: uuidv4 } = require("uuid");

const PAGE_SIZE = Number(process.env.YARN_PAGE_SIZE || 30);

function shapeHistoryForLLM(history = []) {
  if (!Array.isArray(history)) return [];
  const cleaned = history
    .map((h) => ({
      role: h?.role === "assistant" ? "assistant" : "user",
      text: String(h?.text ?? "").slice(0, 4000),
    }))
    .filter((h) => h.text.trim().length > 0);
  return cleaned.slice(-16);
}

async function resolveUser(req, res) {
  const existing = req.user;
  if (existing && existing._id && Types.ObjectId.isValid(existing._id)) {
    return existing;
  }

  let deviceId = req.headers["x-device-id"] || req.cookies?.deviceId;
  if (typeof deviceId !== "string" || !deviceId.trim()) {
    deviceId = uuidv4();
    res.cookie("deviceId", deviceId, {
      sameSite: "lax",
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
  }

  let user = await User.findOne({ deviceId });
  if (!user) {
    user = await User.create({ deviceId });
  }

  req.user = user;
  return user;
}

/* -------------------------------------------------------------------------- */
/* GET /v1/yarn/messages                                                      */
/* -------------------------------------------------------------------------- */
exports.getMessages = async (req, res, next) => {
  try {
    const user = await resolveUser(req, res);
    const filter = user?._id ? { userId: user._id } : {};

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || PAGE_SIZE, 1),
      200
    );

    const cursor = req.query.cursor;
    if (cursor) {
      if (!Types.ObjectId.isValid(cursor)) {
        return res
          .status(400)
          .json({ message: "Invalid cursor (expected ObjectId string)" });
      }
      filter._id = { $gt: new Types.ObjectId(cursor) };
    }

    const messages = await YarnMessage.find(filter)
      .sort({ _id: 1 })
      .limit(limit)
      .select({ _id: 1, role: 1, text: 1, createdAt: 1 })
      .lean();

    const nextCursor =
      messages.length === limit
        ? String(messages[messages.length - 1]._id)
        : undefined;

    res.json({ messages, nextCursor });
  } catch (e) {
    next(e);
  }
};

/* -------------------------------------------------------------------------- */
/* POST /v1/yarn/message                                                      */
/* -------------------------------------------------------------------------- */
exports.postMessage = async (req, res, next) => {
  try {
    const user = await resolveUser(req, res);
    const userId = user?._id;

    // 🔍 LOGGING — see exactly what came in
    console.log("🟢 POST /v1/yarn/message incoming ----------------------");
    console.log("Headers:", {
      "x-device-id": req.headers["x-device-id"],
      cookie: req.headers["cookie"],
      origin: req.headers["origin"],
    });
    console.log("Body received:", req.body);
    console.log("Resolved user:", {
      id: userId?.toString(),
      deviceId: user.deviceId,
    });
    console.log("--------------------------------------------------------");

    const { message, history = [] } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "message (string) required" });
    }

    const userMsg = await YarnMessage.create({
      userId,
      role: "user",
      text: message,
    });

    const shapedHistory = shapeHistoryForLLM(history);

    let botText = null;
    try {
      const reply = await chatOnce({ message, history: shapedHistory });
      botText = (reply && reply.text) || null;
    } catch (e) {
      console.warn("⚠️ LLM unavailable:", e?.message || e);
      botText =
        "I'm having trouble thinking right now, but I'm here with you. " +
        "Would you like to tell me a little more while I get back on track?";
    }

    const botMsg = await YarnMessage.create({
      userId,
      role: "assistant",
      text: botText,
    });

    // 🧾 final response log
    console.log("✅ POST /v1/yarn/message success:", {
      userMsg: { id: userMsg._id, text: userMsg.text },
      botMsg: { id: botMsg._id, text: botMsg.text?.slice(0, 120) },
    });

    res.json({
      success: true,
      userMessage: {
        _id: String(userMsg._id),
        role: userMsg.role,
        text: userMsg.text,
        createdAt: userMsg.createdAt,
      },
      botMessage: {
        _id: String(botMsg._id),
        role: botMsg.role,
        text: botMsg.text,
        createdAt: botMsg.createdAt,
      },
    });
  } catch (e) {
    console.error("❌ POST /v1/yarn/message error:", e);
    next(e);
  }
};
