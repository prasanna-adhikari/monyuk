// src/models/Resource.js
const { Schema, model } = require("mongoose");
const ResourceSchema = new Schema(
  {
    kind: { type: String, enum: ["phone", "url"] },
    label: String,
    value: String,
    region: { type: String, index: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = model("Resource", ResourceSchema);
