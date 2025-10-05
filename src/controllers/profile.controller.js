// src/controllers/profile.controller.js
const User = require("../models/User");
const { nanoid } = require("nanoid");

/**
 * GET /v1/profile
 * Returns the user's profile, always including people[].
 */
exports.getProfile = async (req, res, next) => {
  try {
    const u = await User.findById(req.userId);
    if (!u) return res.status(404).json({ message: "user not found" });

    const body = {
      id: u._id,
      name: u.name || "Your profile",
      // Return null (not "boy") so client can show placeholder when unset
      avatarKey: u.avatarKey ?? null,
      people: Array.isArray(u.people) ? u.people : [],
      email: u.email || null,
    };

    const headers = {};
    if (req.deviceId) headers["x-device-id"] = req.deviceId;
    res.set(headers).json(body);
  } catch (e) {
    next(e);
  }
};

/**
 * PUT /v1/profile
 * body: { name?, avatarKey?, people? }
 * - avatarKey: null | '' | '__none__'  => clears avatar (sets to null)
 * - upsert enabled: creates user doc if missing (device-only flow safety)
 */
exports.putProfile = async (req, res, next) => {
  try {
    const { name, avatarKey, people } = req.body || {};
    const update = {};

    if (name !== undefined) update.name = name;

    if (avatarKey !== undefined) {
      // allow explicit clearing from client
      if (avatarKey === null || avatarKey === "" || avatarKey === "__none__") {
        update.avatarKey = null;
      } else {
        update.avatarKey = avatarKey;
      }
    }

    if (Array.isArray(people)) update.people = people;

    const u = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    if (!u) return res.status(404).json({ message: "user not found" });

    res.json({
      id: u._id,
      name: u.name || "Your profile",
      avatarKey: u.avatarKey ?? null,
      people: Array.isArray(u.people) ? u.people : [],
      email: u.email || null,
    });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /v1/profile/people
 * body: { id?, name, relation?, avatarKey? }
 * Adds a support person; upserts the user if needed.
 */
exports.addPerson = async (req, res, next) => {
  try {
    const { id, name, relation, avatarKey } = req.body || {};
    if (!name) return res.status(400).json({ message: "name required" });

    const person = {
      id: id || nanoid(),
      name,
      relation: relation || undefined,
      avatarKey: avatarKey || undefined,
    };

    const u = await User.findByIdAndUpdate(
      req.userId,
      { $push: { people: person } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ person, people: u.people || [] });
  } catch (e) {
    next(e);
  }
};

/**
 * DELETE /v1/profile/people/:id
 * Removes a support person by id.
 */
exports.removePerson = async (req, res, next) => {
  try {
    const { id } = req.params || {};
    if (!id) return res.status(400).json({ message: "id required" });

    const u = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { people: { id } } },
      { new: true }
    );

    res.json({ people: u ? u.people : [] });
  } catch (e) {
    next(e);
  }
};
