const { uploadFile } = require("../controllers/firebasestorage");

var express = require("express");
var router = express.Router();
  
router.route("/uploadFile").post(uploadFile);


module.exports = router;
  