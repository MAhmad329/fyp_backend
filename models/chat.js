const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  content: { type: String, required: false }, // Content is no longer required to allow file-only messages
  fileUrl: { type: String, required: false }, // Add fileUrl field
  fileType: { type: String, required: false }, // Add fileType field
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const chatSchema = new mongoose.Schema({
  type: { type: String, enum: ['individual', 'team'], required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' }], // For individual chats
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // For team chats
  messages: [messageSchema] // Store messages directly in the chat document
});

const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { Chat, Message };
