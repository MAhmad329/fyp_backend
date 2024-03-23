var express = require("express");
const {
  registerCompany,
  loginCompany,
  logoutCompany,
  forgetPassword,
  resetPassword,
  setNewPassword,
//   getMyCompanyProfile,
//   updateCompanyProfile,
} = require("../controllers/company");
var router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");

/* GET users listing. */
router.get("/Company", function (req, res, next) {
  res.send("Hello its Company");
});

router.route("/Company/register").post(registerCompany);
router.route("/Company/login").post(loginCompany);
router.route("/Company/logout").get(logoutCompany);
router.route("/Company/forgetpassword").post(forgetPassword)
router.route("/Company/resetpassword").post(resetPassword)
router.route("/Company/setnewpassword").put(setNewPassword)
// router
//   .route("/Company/updateprofile")
//   .put(isAuthenticated, updateCompanyProfile);
// router
//   .route("/Company/myprofile")
//   .get(isAuthenticated, getMyCompanyProfile);

module.exports = router;