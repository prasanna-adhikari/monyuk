const router = require("express").Router();
const ctrl = require("../controllers/profile.controller");

// These rely on auth middleware (JWT or device)
router.get("/", ctrl.getProfile);
router.put("/", ctrl.putProfile);

module.exports = router;
