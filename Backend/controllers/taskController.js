const mongoose = require("mongoose");
const Task = require("../models/Task");
const TaskAssignment = require("../models/TaskAssignment");

// 👑 ADMIN CHECK HELPER
const isAdmin = (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Access denied. Admin only." });
    return false;
  }
  return true;
};

// ✅ CREATE TASK (ADMIN ONLY)
exports.createTask = async (req, res, next) => {
  try {
    if (!isAdmin(req, res)) return;

    const { title, description, assignedTo, deadline } = req.body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Valid title required" });
    }

    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ message: "Assign at least one user" });
    }

const task = await Task.create({
  title,
  description,
  deadline: deadline ? new Date(deadline) : null, // ✅ FIX
  createdBy: req.user.id,
});

    const assignments = assignedTo.map((userId) => ({
      taskId: task._id,
      userId,
    }));

    await TaskAssignment.insertMany(assignments);

    res.status(201).json({
      message: "Task created & assigned successfully",
      task,
    });

  } catch (err) {
    next(err);
  }
};

// ✅ GET ALL TASKS (ADMIN ONLY)
exports.getAllTasks = async (req, res, next) => {
  try {
    if (!isAdmin(req, res)) return;

    const assignments = await TaskAssignment.find()
      .populate("taskId", "title description deadline createdAt")
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    const groupedTasks = {};

    assignments.forEach((a) => {
      if (!a.taskId || !a.userId) return;

      const taskId = a.taskId._id.toString();

      if (!groupedTasks[taskId]) {
        groupedTasks[taskId] = {
          task: a.taskId,
          users: [],
        };
      }

      groupedTasks[taskId].users.push({
        user: a.userId,
        status: a.status,
        submission: a.submission,
      });
    });

    res.json(Object.values(groupedTasks));

  } catch (err) {
    next(err);
  }
};
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ["pending", "under_review", "completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const assignment = await TaskAssignment.findOne({
      taskId: req.params.id,
      userId: req.user.id,
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // ✅ update status properly
    assignment.status = status;
    await assignment.save(); // 🔥 updates updatedAt

    res.json(assignment);

  } catch (err) {
    next(err);
  }
};
// ✅ DELETE TASK (ADMIN ONLY)
exports.deleteTask = async (req, res, next) => {
  try {
    if (!isAdmin(req, res)) return;

    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Task.findByIdAndDelete(taskId);
    await TaskAssignment.deleteMany({ taskId });

    res.json({ message: "Task deleted successfully" });

  } catch (err) {
    next(err);
  }
};

// ✅ COMPLETE TASK (ADMIN ONLY)
exports.completeTask = async (req, res, next) => {
  try {
    if (!isAdmin(req, res)) return;

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const assignment = await TaskAssignment.findOne({
      taskId: req.params.id,
      userId,
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // ✅ update status + trigger updatedAt automatically
    assignment.status = "completed";
    await assignment.save(); // 🔥 IMPORTANT (updates updatedAt)

    res.json({
      message: "Task marked as completed",
      assignment,
    });

  } catch (err) {
    next(err);
  }
};

// 👤 USER: SUBMIT TASK
exports.submitTask = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Submission cannot be empty" });
    }

    const assignment = await TaskAssignment.findOne({
      taskId: req.params.id,
      userId: req.user.id,
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.submission = {
      text,
      submittedAt: new Date(),
    };

    assignment.status = "under_review";

    await assignment.save(); // ✅ ensures updatedAt updates

    res.json({
      message: "Task submitted successfully",
      assignment,
    });

  } catch (err) {
    next(err);
  }
};

// 👤 USER: GET MY TASKS
exports.getMyTasks = async (req, res, next) => {
  try {
    const assignments = await TaskAssignment.find({
      userId: req.user.id,
    })
      .populate("taskId", "title description deadline createdAt")
      .sort({ createdAt: -1 });

    res.json(assignments);

  } catch (err) {
    next(err);
  }
};
exports.updateTask = async (req, res, next) => {
  try {
    if (!isAdmin(req, res)) return;

    const { title, description, deadline } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
      message: "Task updated successfully",
      task,
    });

  } catch (err) {
    next(err);
  }
};