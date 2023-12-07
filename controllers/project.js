const Projects = require("../models/project");

const Companies = require("../models/company");

exports.createProject = async (req, res) => {
  try {
    const newProjectData = {
      title: req.body.title,
      description: req.body.description,
      budget: req.body.budget,
      type: req.body.type,
      technologystack: req.body.technologystack,
      owner: req.company._id,
    };
    const newProject = await Projects.create(newProjectData);
    const company = await Companies.findById(req.company._id);
    company.projects.push(newProject._id);
    await company.save();

    res.status(201).json({
      success: true,
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
    const projects = await Projects.find();

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

exports.searchProjects = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Project title is required for search.",
      });
    }

    const projects = await Projects.find({ title: { $regex: new RegExp(title, "i") } });

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