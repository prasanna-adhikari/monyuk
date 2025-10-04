// src/models/Strength.js
const { Schema, model } = require("mongoose");
const StrengthSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    text: String,
  },
  { timestamps: true }
);
module.exports = model("Strength", StrengthSchema);
