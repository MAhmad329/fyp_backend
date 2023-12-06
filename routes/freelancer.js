var express = require("express");
const {
  registerFreelancer,
  loginFreelancer,
  logoutFreelancer,
//   getMyFreelancerProfile,
//   updateFreelancerProfile,
} = require("../controllers/freelancer");
var router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");

/* GET users listing. */
router.get("/Freelancer", function (req, res, next) {
  res.send("Hello its Freelancer");
});

router.route("/Freelancer/register").post(registerFreelancer);
router.route("/Freelancer/login").post(loginFreelancer);
router.route("/Freelancer/logout").get(logoutFreelancer);
// router
//   .route("/Freelancer/updateprofile")
//   .put(isAuthenticated, updateFreelancerProfile);
// router
//   .route("/Freelancer/myprofile")
//   .get(isAuthenticated, getMyFreelancerProfile);

module.exports = router;