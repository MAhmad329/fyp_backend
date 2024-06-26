var mongoose = require("mongoose");

var projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
    },
  
  type: {
    type: String,
    required: true,
    },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  
  // Arrays to store freelancers or teams applying for the project
  freelancerApplicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Freelancer"
  }],
  
  teamApplicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team"
  }],

  // Flag to indicate whether the project requires a team or a single freelancer
  requiresTeam: {
    type: Boolean,
    default: false, // Change to true if the project requires a team
  },

  // ID of the selected freelancer or team for the project
  selectedApplicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Freelancer", // Default reference
    default: null, // No one is selected initially
  },

  selectedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team", // Default reference
    default: null, // No one is selected initially
  },

  // Budget for the project
  budget: {
    type: Number,
    required: true,
  },
  
  requiredMembers: [{
    type: String,
    required: true,
  }
  ],

  requiredSkills: [{
    type: String
  }],
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
  },
  paymentIntentId: String,
  amount: String,
  currency: String,
  stripeStatus: String,
  status: {
    type: String,
    enum: ['posted', 'working', 'complete_request', 'disputed', 'completed'],
    default: 'posted'
  }
});

// Conditionally set the ref for selectedApplicant based on requiresTeam
projectSchema.path('selectedApplicant').ref = function() {
  return this.requiresTeam ? 'Team' : 'Freelancer';
};

module.exports = mongoose.model("Project", projectSchema);