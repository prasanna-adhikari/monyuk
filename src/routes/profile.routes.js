// src/routes/profile.routes.js
const router = require("express").Router();
const ctrl = require("../controllers/profile.controller");

// Profile read/update
router.get("/", ctrl.getProfile);
router.put("/", ctrl.putProfile);

// Support people management
router.post("/people", ctrl.addPerson);
router.delete("/people/:id", ctrl.removePerson);

module.exports = router;
