// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const { errorHandler } = require("./middleware/error");
const { auth } = require("./middleware/auth");
const bootstrapAuth = require("./middleware/bootstrapAuth"); // ✅ note: no .default

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const yarnRoutes = require("./routes/yarn.routes"); // must export an Express.Router()

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("tiny"));

// ✅ Ensure this is a function (middleware)
app.use(bootstrapAuth);

// Optional JWT auth (won’t break anonymous flow)
app.use(auth);

app.get("/v1/health", (req, res) =>
  res.json({
    ok: true,
    userId: req.userId || null,
    deviceId: req.deviceId || null,
  })
);

// ✅ Ensure these are Routers, not plain objects
app.use("/v1/auth", authRoutes);
app.use("/v1/profile", profileRoutes);
app.use("/v1/yarn", yarnRoutes);

app.use(errorHandler);

module.exports = app;
