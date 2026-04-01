// models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

 deadline: {
  type: Date,
  default: null,
}

}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);