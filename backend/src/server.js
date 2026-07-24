require("dotenv").config();

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const resumeRoutes = require("./routes/resume.routes");
const {
  errorMiddleware,
  notFoundMiddleware,
} = require("./middleware/error.middleware");

const app = express();

const PORT = process.env.PORT || 8080;

// ---------------- Security ----------------
app.use(helmet());

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

// ---------------- Body Parser ----------------
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------- CORS ----------------
const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes("*")
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// ---------------- Rate Limiter ----------------
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// ---------------- Root Route ----------------
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "AI Resume Analyzer Backend Running 🚀",
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
  });
});

// ---------------- Health ----------------
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ---------------- API ----------------
app.use("/api/resume", resumeRoutes);

// ---------------- 404 ----------------
app.use(notFoundMiddleware);

// ---------------- Error Handler ----------------
app.use(errorMiddleware);

// ---------------- Start Server ----------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 AI Resume Analyzer backend listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;