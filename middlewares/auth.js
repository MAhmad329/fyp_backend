const Companies = require("../models/company");
const Freelancers = require("../models/freelancer");
const jwt = require("jsonwebtoken");

exports.isCompanyAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        message: "Please Login First",
      });
    }

    const decoded = await jwt.verify(token, "creatingatestJWTkey");

    req.company = await Companies.findById(decoded._id);

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.isAuthenticated = async (req, res, next) => {
  //console.log(req)

  try {
    const { token } = req.cookies;
    console.log(token)
    if (!token) {
      return res.status(401).json({
        message: "Please Login First",
      });
    }

    const decoded = await jwt.verify(token, "creatingatestJWTkey");

    req.freelancer = await Freelancers.findById(decoded._id);

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

