const Dispute = require('../models/dispute');
const Project = require('../models/project');

// exports.createDispute = async (req, res) => {

//     const { projectId, description } = req.body;
//   try {
    
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).send({ message: 'Project not found' });
//     }

//     // Update project status to disputed
//     project.status = 'disputed';
//     await project.save();

//     // Create a new dispute
//     const dispute = new Dispute({
//       description,
//       project: projectId
//     });
//     await dispute.save();

//     res.status(201).send(dispute);
//   } catch (error) {
//     res.status(500).send({ message: 'Error creating dispute', error });
//   }
// };



exports.createDispute = async (req, res) => {
    const { projectId, description } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send({ message: 'Project not found' });
        }

        // Check if a dispute already exists for this project
        let dispute = await Dispute.findOne({ project: projectId });

        if (dispute) {
            // If dispute exists, update it
            dispute.description = description;
            await dispute.save();
            res.status(200).send({ message: 'Dispute updated successfully', dispute });
        } else {
            // If no dispute exists, create a new one
            dispute = new Dispute({
                description,
                project: projectId
            });
            await dispute.save();
            res.status(201).send(dispute);
        }

        // Update project status to disputed only if not already disputed
        if (project.status !== 'disputed') {
            project.status = 'disputed';
            await project.save();
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Error creating or updating dispute', error });
    }
};

exports.getDisputeByProjectId = async (req, res) => {
    const { projectId } = req.params;

    try {
        // Find the dispute associated with the given projectId
        const dispute = await Dispute.findOne({ project: projectId }).populate('project', 'title'); // Using populate to include project title

        if (!dispute) {
            return res.status(404).send({ message: 'No dispute found for this project' });
        }

        res.status(200).send({ disputeId: dispute.id, description: dispute.description, projectTitle: dispute.project.title });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Error retrieving dispute', error });
    }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).send({ message: 'Dispute not found' });
    }

    dispute.status = 'resolved';
    await dispute.save();

    // Optionally update the project status
    const project = await Project.findById(dispute.project);
    project.status = 'completed';
    await project.save();

    res.status(200).send(dispute);
  } catch (error) {
    res.status(500).send({ message: 'Error resolving dispute', error });
  }
};