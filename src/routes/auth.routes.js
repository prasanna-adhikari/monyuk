const router = require("express").Router();
const { authLimiter } = require("../middleware/rateLimit");
const ctrl = require("../controllers/auth.controller");

// Lightweight rate limit to protect auth
router.post("/signup", authLimiter, ctrl.signup);
router.post("/login", authLimiter, ctrl.login);
router.post("/anonymous", ctrl.anonymous);

module.exports = router;
