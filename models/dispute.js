const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Dispute = mongoose.model('Dispute', disputeSchema);
module.exports = Dispute;