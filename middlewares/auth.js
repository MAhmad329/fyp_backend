const Companies = require("../models/company");
// const Recruiters = require("../models/recruiter");
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
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        message: "Please Login First",
      });
    }

    const decoded = await jwt.verify(token, "creatingatestJWTkey");

    req.freelancer = await Freelancer.findById(decoded._id);

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

