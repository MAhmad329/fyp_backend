const Team = require("../models/team");
const Task = require("../models/task");
const Freelancer = require("../models/freelancer");

// Method to add a task for a team member
exports.addTaskToMember = async (req, res) => {
  try {
    const { memberId, description, deadline } = req.body;
    const teamId=req.params.teamId
    const ownerId = req.freelancer._id; // Assuming the owner's ID is in req.freelancer after authentication

    // Find the team by ID
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Verify that the owner is making the request
    if (team.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({ error: 'Only the team owner can add tasks' });
    }

    // Check if the member is in the team
    const isMemberInTeam = team.members.some(member => member.toString() === memberId);
    if (!isMemberInTeam) {
      return res.status(404).json({ error: 'Member is not in the team' });
    }

    // Create and save the new task
    const task = new Task({
      description,
      assignee: memberId,
      deadline,
      team: teamId,
      status: 'pending' // Default status
    });

    await task.save();

    res.status(201).json({ message: 'Task added successfully', task });
  } catch (error) {
    console.error('Error adding task to member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};