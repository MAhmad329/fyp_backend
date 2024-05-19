const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, required: true, refPath: 'senderModel' },
  content: { type: String, required: false },
  fileUrl: { type: String, required: false },
  fileType: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  senderModel: { type: String, required: true, enum: ['Freelancer', 'Company'] }
});

const chatSchema = new Schema({
  type: { type: String, enum: ['individual'], required: true },
  participants: [{ type: Schema.Types.ObjectId, refPath: 'participantModels' }],
  participantModels: [{ type: String, required: true, enum: ['Freelancer', 'Company'] }],
  messages: [messageSchema]
});

const FreelancerCompanyChat = mongoose.model('FreelancerCompanyChat', chatSchema);
const FreelancerCompanyMessage = mongoose.model('FreelancerCompanyMessage', messageSchema);

module.exports = { FreelancerCompanyChat, FreelancerCompanyMessage };
