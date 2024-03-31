const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Freelancer",
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Freelancer",
    required: true,
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  }],
  assignedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  }],
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
