const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../Middlewares/authMiddleware");
const User = require("../models/user");

// 👑 GET ONLY NORMAL USERS (NOT ADMIN)
router.get("/", protect, authorize("admin"), async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");

    res.json(users);
  } catch (err) {
    next(err); // 🔥 use global error handler
  }
});

module.exports = router;