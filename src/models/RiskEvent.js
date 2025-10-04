// src/models/RiskEvent.js
const { Schema, model } = require("mongoose");
const RiskEventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    type: { type: String, enum: ["self_harm", "distress", "other"] },
    source: { type: String }, // message id or context
    actionShown: [String], // e.g., ['lifeline','13yarn','000']
  },
  { timestamps: true }
);
module.exports = model("RiskEvent", RiskEventSchema);
