const express = require("express");
const cors = require("cors");
require("dotenv").config();

const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// 🔥 ENV VALIDATION
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env"); 
}
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing in .env");
}

// 🔥 MIDDLEWARE
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));

app.use(express.json());
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// 🔥 RATE LIMIT
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});
app.use("/api", limiter);

// 🔥 ROUTES
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/users", userRoutes);

// 🔥 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 🔥 GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

// 🔥 START SERVER SAFELY
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server start failed:", error.message);
    process.exit(1);
  }
};

startServer();

// 🔥 HANDLE PROMISE ERRORS
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  process.exit(1);
});