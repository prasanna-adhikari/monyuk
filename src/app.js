const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const { errorHandler } = require("./middleware/error");
const { auth } = require("./middleware/auth");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("tiny"));

// Attach user context (JWT or anonymous device)
app.use(auth);

// Health
app.get("/v1/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/v1/auth", authRoutes);
app.use("/v1/profile", profileRoutes);

// Errors
app.use(errorHandler);

module.exports = app;
