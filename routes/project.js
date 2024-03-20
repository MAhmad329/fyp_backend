var express = require("express");
const {
  createProject,
  deleteProject,
  getAllProjects,
  searchProjects,
  applyToProject,
  getProjectDetails
} = require("../controllers/project");
var router = express.Router();
const { isCompanyAuthenticated, isAuthenticated } = require("../middlewares/auth");

router.route("/project/post").post( createProject);
router.route("/project/getProjects").get(getAllProjects);
router.route("/project/searchProject").post(searchProjects);
router.route("/project/getProject/:id").post(getProjectDetails);
router.route("/project/:id").delete(isCompanyAuthenticated, deleteProject);
router.route("/project/:id/applyToProjectAuthenticated").post(isAuthenticated, applyToProject);
router.route("/project/applyToProject/:id").post(applyToProject);

module.exports = router;