// src/models/CheckIn.js
const { Schema, model } = require("mongoose");
const CheckInSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    scores: { type: Schema.Types.Mixed, required: true }, // {calm:0..4, ...}
    rawTotal: Number,
    adjustedTotal: Number,
    severe: Boolean,
    notes: String,
  },
  { timestamps: true }
);
module.exports = model("CheckIn", CheckInSchema);
