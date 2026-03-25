const Task = require("../models/Task");


// ✅ CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      title,
      description,
      status,
      user: req.user.id,
    });

    res.status(201).json(task);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating task" });
  }
};



// ✅ GET ALL TASKS (ONLY USER'S TASKS)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json(tasks);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};



// ✅ GET SINGLE TASK
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching task" });
  }
};



// ✅ UPDATE TASK (SECURE)
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id, // 🔥 important security
      },
      { title, description, status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.status(200).json(task);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating task" });
  }
};



// ✅ DELETE TASK (SECURE)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id, // 🔥 important security
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.status(200).json({ message: "Task deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting task" });
  }
};