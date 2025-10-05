// src/models/YarnMessage.js
const mongoose = require("mongoose");

const YarnMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("YarnMessage", YarnMessageSchema);
