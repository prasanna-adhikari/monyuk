const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
