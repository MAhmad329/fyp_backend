const Projects = require("../models/project");
const Freelancer = require("../models/freelancer")
const Companies = require("../models/company");
const Team = require("../models/team");

exports.createProject = async (req, res) => {
  try {
    const newProjectData = {
      title: req.body.title,
      description: req.body.description,
      budget: req.body.budget,
      type: req.body.type,
      technologystack: req.body.technologystack,
      requiresTeam: req.body.requiresTeam,
      requiredMembers: req.body.requiredMembers,
      requiredSkills: req.body.requiredSkills,
      owner: req.company._id,
      deadline: req.body.deadline,
    };

    const newProject = await Projects.create(newProjectData);
    const company = await Companies.findById(req.company._id);
    company.projects.push(newProject._id);
    await company.save();

    res.status(201).json({
      success: true,
      message: "Project Created",
      project: newProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    console.log(error);
  }
};





exports.deleteProject = async (req, res) => {
  try {
    const project = await Projects.findById(req.params.id); // Params.id means the id we'll pass after the url
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project Not Found",
      });
    }

    if (project.owner.toString() !== req.company._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "UnAuthorized",
      });
    } else {
      await project.deleteOne();
      const company = await Companies.findById(req.company._id);
      const index = company.projects.indexOf(req.params.id);
      company.projects.splice(index, 1);
      await company.save();

      return res.status(200).json({
        success: true,
        message: "Project Deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Projects.find().populate('owner');

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllFreelancerProjects = async (req, res) => {
  try {
    const projects = await Projects.find({ requiresTeam: false });

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getProjectsRequiringTeam = async (req, res) => {
  try {
    const projects = await Projects.find({ requiresTeam: true });

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCompanyFreelancerProjects = async (req, res) => {
  try {
    const companyId = req.company.id;
    const projects = await Projects.find({ owner: companyId, requiresTeam:false }).populate('owner', 'name').populate('freelancerApplicants');
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
};
exports.getCompanyTeamProjects = async (req, res) => {
  try {
    const companyId = req.company.id;
    console.log(companyId)
    const projects = await Projects.find({ owner: companyId, requiresTeam:true }).populate('owner', 'name').populate({
        path: 'teamApplicants',
        populate: {
          path: 'members'
        }
      });
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
};

exports.getApplicants = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Projects.findById(projectId)
      .populate('freelancerApplicants')
      .populate({
        path: 'teamApplicants',
        populate: { path: 'members' }
      });

    if (!project) {
      return res.status(404).send({ message: 'Project not found' });
    }

    let applicants = project.requiresTeam ? project.teamApplicants : project.freelancerApplicants;

    if (project.requiresTeam) {
      // Create a new array to hold team applicants with their skills
      let teamApplicantsWithSkills = [];

      // Loop through each team applicant
      applicants.forEach(teamApplicant => {
        // Initialize an array to store the skills of this team's members
        let teamSkills = [];

        // Loop through each member of the team
        teamApplicant.members.forEach(member => {
          // Concatenate the member's skills to the teamSkills array
          teamSkills = teamSkills.concat(member.skills);
        });

        // Remove duplicates from the teamSkills array
        teamSkills = [...new Set(teamSkills)];

        // Add the team applicant with its skills to the new array
        teamApplicantsWithSkills.push({
          teamApplicant: teamApplicant,
          skills: teamSkills
        });
      });

      // Update the applicants array to include skills
      applicants = teamApplicantsWithSkills;
    }

    res.status(200).json({
      success: true,
      project: project,
      count: applicants.length,
      applicants: applicants
    });
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving applicants', error: error.message });
  }
};






exports.searchProjects = async (req, res) => {
  try {
    const { title } = req.body;
    

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Project title is required for search.",
      });
    }

    const project = await Projects.find({ title: { $regex: new RegExp(title, "i") } }).populate('owner');

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.applyToProjectAuthenticated = async (req, res) => {
  try {
    const  freelancerId  = req.freelancer._id;
    const  projectId  = req.params.id;

    // Check if the freelancer has already applied to the project
    const project = await Projects.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.freelancerApplicants.includes(freelancerId)) {
      return res.status(400).json({ success: false, message: 'Freelancer already applied to the project.' });
    }

    // Update the project with the freelancer's application
    project.freelancerApplicants.push(freelancerId);
    await project.save();

    // Optionally, update the freelancer model with the applied project
    const freelancer = await Freelancer.findById(freelancerId);
    if (freelancer) {
      freelancer.appliedProjects.push(projectId);
      await freelancer.save();
    }

    res.status(200).json({ success: true, message: 'Application successful.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.applyToProject = async (req, res) => {
  try {
    //if authentication route
    //const  freelancerId  = req.freelancer._id;
    //const  projectId  = req.params.id;
    //else jugaru without authentication
    const freelancerId = req.freelancer._id;
    const  projectId  = req.params.id;

    // Check if the freelancer has already applied to the project
    const project = await Projects.findById(projectId);
    if (!project) {
      console.log('Project not found');
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.freelancerApplicants.includes(freelancerId)) {
      console.log('Freelancer already applied to the project');
      return res.status(400).json({ success: false, message: 'Freelancer already applied to the project.' });
    }

    // Update the project with the freelancer's application
    project.freelancerApplicants.push(freelancerId);
    await project.save();

    // Optionally, update the freelancer model with the applied project
    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      console.log('Freelancer not found');
      res.status(400).json({ success: false, message: 'Freelancer null' });
    }
    
    freelancer.appliedProjects.push(projectId);
    await freelancer.save();
  


    res.status(200).json({ success: true, message: 'Application successful.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.teamApplyToProject = async (req, res) => {
  try {
    //if authentication route
    //const  freelancerId  = req.freelancer._id;
    //const  projectId  = req.params.id;
    //else jugaru without authentication
    const freelancerId = req.freelancer._id;
    const projectId = req.params.id;
    const teamId = req.freelancer.teams._id;

    console.log(freelancerId)
    //console.log(projectId)
    //console.log(teamId)

    //const freelancer = await Freelancer.findById(freelancerId);
    const team = await Team.findById(teamId);
    console.log(team.owner.toString())

    if (!req.freelancer) {
      console.log('Freelancer null');
      return res.status(400).json({ success: false, message: 'Freelancer null' });
    }

    if (!teamId) { 
      console.log('Team null');
      return res.status(400).json({ success: false, message: 'Freelancer doesn\'t have a team'});
    }

  
    const project = await Projects.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.teamApplicants.includes(teamId)) {
      console.log('Already applied');
      return res.status(400).json({ success: false, message: 'Team has already applied to the project.' });
    }

    if (team.owner.toString() !== freelancerId.toString()) {
      console.log('You are not the leader');
      return res.status(400).json({ success: false, message: 'You are not the leader.' });
    }

    // Update the project with the freelancer's application
    project.teamApplicants.push(teamId);
    await project.save();

    // Optionally, update the freelancer model with the applied project
    
    
    team.projects.push(projectId);
    await team.save();
  


    res.status(200).json({ success: true, message: 'Application successful.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.cancelApplyToProject = async (req, res) => {
  try {
    const freelancerId = req.freelancer._id;
    const projectId = req.params.id;

    // Check if the project exists
    const project = await Projects.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if the project requires a team
    if (project.requiresTeam) {
      // Get the freelancer's team
      const freelancer = await Freelancer.findById(freelancerId).populate('teams');
      if (!freelancer || !freelancer.teams) {
        return res.status(400).json({ success: false, message: 'Freelancer or team not found' });
      }

      // Remove the team's application from the project
      await Projects.updateOne(
        { _id: projectId },
        { $pull: { teamApplicants: freelancer.teams._id } }
      );
    } else {
      // Remove the freelancer's application from the project
      await Projects.updateOne(
        { _id: projectId },
        { $pull: { freelancerApplicants: freelancerId } }
      );

      // Optionally, update the freelancer model by removing the applied project
      const freelancer = await Freelancer.findById(freelancerId);
      if (!freelancer) {
        return res.status(400).json({ success: false, message: 'Freelancer not found' });
      }
      await Freelancer.updateOne(
        { _id: freelancerId },
        { $pull: { appliedProjects: projectId } }
      );
    }

    res.status(200).json({ success: true, message: 'Application canceled successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};




exports.getProjectDetails = async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required.',
      });
    }

    const project = await Projects.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAppliedProjects = async (req, res) => {
  try {
    const freelancerId = req.freelancer._id;

    const freelancer = await Freelancer.findById(freelancerId).populate('appliedProjects');
    var type;
        if (!freelancer) {
            return res.status(404).json({
              success: false,
              message: 'Freelancer not found',
            })
        }

        if (freelancer.teams) {
            // If freelancer has a team, fetch projects of the team
            const team = await Team.findById(freelancer.teams).populate('projects');
            const projects = team.projects;
            type="team"
            return res.status(200).json({
              success: true,
              type,
              message:"Fetched Team Projects Successfully",
              projects,
            });
        } else {
            // If freelancer doesn't have a team, return individual applied projects
            const projects = freelancer.appliedProjects;
            type="individual"
            return res.status(200).json({
              success: true,
              type,
              message:"Fetched Individual Projects Successfully",
              projects,
            });
            
        }


  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

exports.getTeamAssignedProjects = async (req, res) => {
  try {
    const freelancerId = req.freelancer._id;

    const freelancerteam = await Freelancer.findById(freelancerId).populate({
      path: 'teams',
      populate: {
        path: 'assignedProjects',
        populate: { path: 'owner' } // Populate the owner field
      }
    });

    // Get the first team
    const team = freelancerteam.teams;

    console.log('Team:', team);

    // Check if the team has any assigned projects
    if (!team || !team.assignedProjects || team.assignedProjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No assigned Projects',
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched Assigned Projects Successfully",
      Projects: team.assignedProjects,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

exports.getSoloAssignedProjects = async (req, res) => {
  try {
    const freelancerId = req.freelancer._id;

    // Fetch the freelancer along with their ongoing projects
    const freelancer = await Freelancer.findById(freelancerId).populate({
      path: 'ongoingProjects',
      populate: { path: 'owner' } // Populate the owner field
    });

    // Check if the freelancer has any ongoing projects
    if (!freelancer.ongoingProjects || freelancer.ongoingProjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No ongoing Projects',
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched Ongoing Projects Successfully",
      Projects: freelancer.ongoingProjects,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


