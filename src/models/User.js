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
    // auth
    email: { type: String, index: true, unique: true, sparse: true },
    passwordHash: { type: String },

    // anonymous device bootstrap
    deviceId: { type: String, index: true, unique: true, sparse: true },

    // profile
    name: { type: String },
    avatarKey: { type: String, default: "boy" },
    people: { type: [SupportPersonSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
