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
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name role");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

module.exports = router;