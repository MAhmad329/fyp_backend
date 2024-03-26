const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Freelancer",
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in progress', 'completed', 'overdue'],
    default: 'pending',
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    required:true,
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
