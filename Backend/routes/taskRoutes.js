const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../Middlewares/authMiddleware");

const {
  createTask,
  getAllTasks,
  getMyTasks,
  updateTask,
  submitTask,
  completeTask,
  updateStatus,
  deleteTask,
} = require("../controllers/taskController");

// ==============================
// 👑 ADMIN ROUTES
// ==============================

// Create task
router.post("/", protect, authorize("admin"), createTask);

// Get all tasks
router.get("/", protect, authorize("admin"), getAllTasks);

// Mark task complete for specific user
router.put("/:id/complete", protect, authorize("admin"), completeTask);

// Delete task
router.delete("/:id", protect, authorize("admin"), deleteTask);
router.put("/:id", protect, authorize("admin"), updateTask);


// ==============================
// 👤 USER ROUTES
// ==============================

// Get my tasks
router.get("/my", protect, authorize("user"), getMyTasks);

// Submit task
router.put("/:id/submit", protect, authorize("user"), submitTask);

// Update status (ONLY USER)
router.put("/:id/status", protect, authorize("user"), updateStatus);


module.exports = router;