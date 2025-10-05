// src/models/User.js
const { Schema, model } = require("mongoose");

const SupportPersonSchema = new Schema(
  {
    id: String,
    name: String,
    relation: String,
    avatarKey: String,
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    // auth (optional if you later add email/password)
    email: { type: String, index: true, unique: true, sparse: true },
    passwordHash: { type: String },

    // anonymous device bootstrap
    deviceId: { type: String, index: true, unique: true, sparse: true },

    // profile
    name: { type: String, default: "Your profile" },
    // ❗ Store null when "No image" is selected; frontend will show placeholder
    avatarKey: { type: String, default: null },
    // Supportive people live under user
    people: { type: [SupportPersonSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
