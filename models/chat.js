const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
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
