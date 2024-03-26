var mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
var companySchema = new mongoose.Schema({

  companyname: {
    type: String,
    required: true,
    unique: true,
  },

  businessAddress: {
    type: String,
    required: true,
    unique: true,
  },

  name: {
    type: String,
    required: true,
  },

  pfp: {
    type: String,
  },

  email: {
    type: String,
    required: [true, "Please enter an Email"],
    unique: [true, "Email already Exists"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minLength: [6, "Password must be atleast 6 chars"],
    select: false, // Means when we'll Access user's data we'll get all user information except this (i.e Password)
  },

  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  ],

  resetPasswordToken: String,
  resetPasswordDate: Date,
});

companySchema.pre("save", async function (next) {
  // It means bcrypt the password on saving
  if (this.isModified("password")) {
    // Do only when password is modified
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

companySchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

companySchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, "creatingatestJWTkey");
};

companySchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  console.log(resetToken);
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordDate = Date.now() + 10 * 6 * 1000; // 10 mins

  return resetToken;
};

companySchema.methods.getResetPasswordCode = function () {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10); // Generate a random digit between 0 and 9
  }
  this.resetPasswordToken = code;
  this.resetPasswordDate = Date.now() + 10 * 60 * 1000; // 10 mins

  return code;
};

const Company = mongoose.model('Company', companySchema);

module.exports = Company;