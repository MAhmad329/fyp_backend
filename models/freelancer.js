var mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
var freelancerSchema = new mongoose.Schema({

  firstname: {
    type: String,
    required: true,
  },

  lastname: {
    type: String,
    required: true,
    },
  
  username: {
    type: String,
    required: [true, "Please enter a username"],
    unique: [true, "Username already Exists"],
  },


  email: {
    type: String,
    required: [true, "Please enter an Email"],
    unique: [true, "Email already Exists"],
  },
  
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minLength: [6, "PSassword must be atleast 6 chars"],
    select: false, // Means when we'll Access user's data we'll get all user information except this (i.e Password)
  },

  resetPasswordToken: String,
  resetPasswordDate: Date,

  
  pfp: {
    type: String,
  },

  aboutme: {
    type: String,
    
  },

  skills: [{
    type: String,
  }],

  education: [
    {
    institution: { type: String },
    course: { type: String},
    startDate: { type: String},
    endDate: { type: String},
}],


  experience: [{
    jobtitle: { type: String },
    company: { type: String},
    startDate: { type: String},
    endDate: { type: String},
}],

  

  appliedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  ],
  teams: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  ongoingProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    }
  ],

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
    },
  ],

  resetPasswordToken: String,
  resetPasswordDate: Date,
});

freelancerSchema.pre("save", async function (next) {
  // It means bcrypt the password on saving
  if (this.isModified("password")) {
    // Do only when password is modified
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

freelancerSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

freelancerSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, "creatingatestJWTkey");
};

freelancerSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  console.log(resetToken);
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordDate = Date.now() + 10 * 6 * 1000; // 10 mins

  return resetToken;
};


freelancerSchema.methods.getResetPasswordCode = function () {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10); // Generate a random digit between 0 and 9
  }
  this.resetPasswordToken = code;
  this.resetPasswordDate = Date.now() + 10 * 60 * 1000; // 10 mins

  return code;
};

const Freelancer = mongoose.model('Freelancer', freelancerSchema);

module.exports = Freelancer;