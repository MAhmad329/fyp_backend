var express = require("express");
const {
  createProject,
  deleteProject,
  getAllProjects,
  searchProjects,
  applyToProject
} = require("../controllers/project");
var router = express.Router();
const { isCompanyAuthenticated, isAuthenticated } = require("../middlewares/auth");

router.route("/project/post").post(isCompanyAuthenticated, createProject);
router.route("/project/getProjects").get(getAllProjects);
router.route("/project/searchProject").post(searchProjects);
router.route("/project/:id").delete(isCompanyAuthenticated, deleteProject);
router.route("/project/:id/applyToProject").post(isAuthenticated, applyToProject);

module.exports = router;