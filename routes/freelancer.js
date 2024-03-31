var express = require("express");
const {
  registerFreelancer,
  loginFreelancer,
  logoutFreelancer,
  getFreelancerDetails,
  updateFreelancerProfile,
  forgetPassword,
  resetPassword,
  setNewPassword
//   getMyFreelancerProfile,
//   updateFreelancerProfile,
} = require("../controllers/freelancer");
const { addMemberToTeam } = require("../controllers/team");
const { deleteMemberFromTeam } = require("../controllers/team");
const { fetchteam } = require("../controllers/team");
const { searchFreelancer } = require("../controllers/freelancer");
const { addTaskToMember, getAllTasks, submitTaskWork, saveTaskStatus } = require("../controllers/task");

var router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");

/* GET users listing. */
router.get("/Freelancer", function (req, res, next) {
  res.send("Hello its Freelancer");
});

router.route("/Freelancer/register").post(registerFreelancer);
router.route("/Freelancer/login").post(loginFreelancer);
router.route("/Freelancer/logout").get(logoutFreelancer);
router.route("/Freelancer/searchFreelancer").post(searchFreelancer);
router.route("/Freelancer/details").get(isAuthenticated, getFreelancerDetails);
router.route("/Freelancer/updateprofile").put(isAuthenticated, updateFreelancerProfile);
router.route("/Freelancer/forgetpassword").post(forgetPassword)
router.route("/Freelancer/resetpassword").post(resetPassword)
router.route("/Freelancer/setnewpassword").put(setNewPassword)
router.route("/Freelancer/fetchteam").get(isAuthenticated,fetchteam)
router.route("/Freelancer/addTeamMember").post(isAuthenticated, addMemberToTeam);
router.route("/Freelancer/deleteMember").post(isAuthenticated, deleteMemberFromTeam);
router.route('/Freelancer/:id/addTask').post(isAuthenticated,addTaskToMember);
router.route('/Freelancer/:id/updateTask').put(isAuthenticated,addTaskToMember);
router.route('/Freelancer/:id/getTasks').get(isAuthenticated,getAllTasks);
router.route('/Freelancer/updateTask').put(isAuthenticated,submitTaskWork);
router.route('/Freelancer/updateTaskStatus').put(isAuthenticated,saveTaskStatus);

module.exports = router;