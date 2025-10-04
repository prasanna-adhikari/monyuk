// src/models/Goal.js
const { Schema, model } = require("mongoose");
const GoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    title: String,
    why: String,
    status: { type: String, default: "active" },
    steps: [{ what: String, who: String, when: String, how: String }],
  },
  { timestamps: true }
);
module.exports = model("Goal", GoalSchema);
