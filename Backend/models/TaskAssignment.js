// models/TaskAssignment.js
const mongoose = require("mongoose");

const taskAssignmentSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

status: {
  type: String,
  enum: ["pending", "under_review", "completed"],
  default: "pending",
},

  submission: {
    text: String,
    fileUrl: String,
    submittedAt: Date,
  }

}, { timestamps: true });

module.exports = mongoose.model("TaskAssignment", taskAssignmentSchema);