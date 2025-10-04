// src/models/YarnMessage.js
const { Schema, model } = require("mongoose");
const YarnMessageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    role: { type: String, enum: ["user", "bot", "system"], required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = model("YarnMessage", YarnMessageSchema);
