var express = require("express");
const {
  createProject,
  deleteProject,
  getAllProjects,
  searchProjects,
  applyToProject,
  getProjectDetails,
  cancelApplyToProject,
  teamApplyToProject,
  getProjectsRequiringTeam,
  getAppliedProjects,
  getCompanyTeamProjects,
  getCompanyFreelancerProjects,
  getApplicants,
  getAllFreelancerProjects,
  getTeamAssignedProjects,
  getSoloAssignedProjects
} = require("../controllers/project");
var router = express.Router();
const { isCompanyAuthenticated, isAuthenticated } = require("../middlewares/auth");

router.route("/project/post").post( isCompanyAuthenticated,createProject);
router.route("/project/getProjects").get(getAllProjects);
router.route("/project/getFreelancerProjects").get(getAllFreelancerProjects);
router.route("/project/getTeamProjects").get(getProjectsRequiringTeam);
router.route("/project/searchProject").post(searchProjects);
router.route("/project/getProject/:id").post(getProjectDetails);
router.route("/project/:id").delete(isCompanyAuthenticated, deleteProject);
router.route("/project/:id/applyToProjectAuthenticated").post(isAuthenticated, applyToProject);
router.route("/project/applyToProject/:id").post(isAuthenticated, applyToProject);
router.route("/project/applyToProjectasTeam/:id").post(isAuthenticated, teamApplyToProject);
router.route("/project/cancelApply/:id").put(isAuthenticated,cancelApplyToProject);
router.route('/project/myAppliedProjects').get(isAuthenticated,getAppliedProjects);
router.route('/Project/getmyTeamprojects').get(isCompanyAuthenticated, getCompanyTeamProjects);
router.route('/Project/getmyFreelancerprojects').get(isCompanyAuthenticated, getCompanyFreelancerProjects);
router.route('/Project/:projectId/applicants').get(getApplicants);
router.route('/project/myTeamAssignedProjects').get(isAuthenticated,getTeamAssignedProjects);
router.route('/project/mySoloAssignedProjects').get(isAuthenticated,getSoloAssignedProjects);





module.exports = router;