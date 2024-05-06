const Team = require("../models/team");
const Task = require("../models/task");
const Freelancer = require("../models/freelancer");

// Method to add a task for a team member
exports.addTaskToMember = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { memberId, description, deadline } = req.body; // Include projectId in the request body
        const  projectId  = req.params.id;
        const teamId = req.freelancer.teams;
        console.log('Team ID:', teamId);

        const ownerId = req.freelancer._id; // Assuming the owner's ID is in req.freelancer after authentication
        console.log('Owner ID:', ownerId);

        // Find the team by ID
        const team = await Team.findById(teamId);
        console.log('Team:', team);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Verify that the owner is making the request
        if (team.owner.toString() !== ownerId.toString()) {
            return res.status(403).json({ error: 'Only the team owner can add tasks' });
        }

        // Check if the member is in the team
        const areAllMembersInTeam = memberId.every(memberId => 
            team.members.some(member => member.toString() === memberId)
        );

        if (!areAllMembersInTeam) {
            return res.status(404).json({ error: 'One or more members are not in the team' });
        }

        // Create and save the new task
        const task = new Task({
            description,
            assignee: memberId,
            owner: ownerId,
            deadline,
            team: teamId,
            project: projectId, // Include the project ID when creating the task
            status: 'pending' // Default status
        });

        await task.save();

        res.status(201).json({success:true, message: 'Task added successfully', task });
    } catch (error) {
        console.error('Error adding task to member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.submitTaskWork = async (req, res) => {
    try {
        const { taskId, workDone } = req.body;

        if (!workDone) {
            return res.status(400).json({
                success: false,
                message: "Missing data"
            });
        }

        const userId = req.freelancer ? req.freelancer._id : null;
        const task = await Task.findById(taskId).populate('assignee'); // Assuming you might need detailed information

        // Check if the user has permission to update the task
        if (!userId || !task.assignee.some(assignee => assignee._id.equals(userId))) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            });
        }

        // Update the task
        task.submittedWork = workDone;
        task.status = "submitted";

        await task.save();

        res.status(201).json({
            success: true,
            message: "Work submitted successfully",
            task
        });
    } catch (error) {
        console.error('Error adding task to member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.saveTaskStatus = async (req, res) => {
    try {
        
        const { taskId, status } = req.body;

        //If no work done or notes are provided, return an error
        if(!status || !taskId){
            return res.status(400).json({
                success: false,
                message: "Missing data"
            });
        };

        
        //Get the logged user id
        const userId = req.freelancer ? req.freelancer._id : null;

        // Find the task with the given ID
        const task = await Task.findById(taskId);

        // Check if the user has permission to update the task
        if (!userId || !task.owner.equals(userId)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            });
        }

        // Update the fields of the task
        task.set({
            
            status: status,
        }).markModified("setStatus"); // Mark modified because we only want to save this field

        // Save the updated task in the database
        await task.save();

        // Send a response back to the client
        res.status(201).json({
            success: true,
            message: "Status changed successfully",
            task
        });
    } catch (error) {
        console.error('Error changing status to task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
      
exports.getAllTasks = async (req, res) => {
    try {
        const  projectId  = req.params.id;
        const teamId = req.freelancer.teams;
        console.log('Project ID:', projectId);
        console.log('Team ID:', teamId);
        // Fetch tasks that match projectId and teamId
        const tasks = await Task.find({ project: projectId, team: teamId }).populate('assignee');

        res.status(200).json({
            success:true,
            message: 'Tasks fetched successfully',
            tasks });

        

    } catch (error) {
        console.error('Error adding task to member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
