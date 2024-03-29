const { Chat, Message } = require("../models/chat");

const Team = require("../models/team"); // Import the Team model

exports.sendMessage = async (req, res) => {
  try {
    const { senderId,receiverId, content, type, team } = req.body;
    let chat;

    if (type === 'individual') {

      chat = await Chat.findOne({
        type: 'individual',
        participants: { $all: [senderId, receiverId] },
      });
    } else if (type === 'team') {
      // Check if the sender is a member of the team
      const teamInfo = await Team.findById(team);
      const isMember = teamInfo.members.includes(senderId) || teamInfo.owner.toString() === senderId;

      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Sender is not a member of the team' });
      }

      chat = await Chat.findOne({
        type: 'team',
        team: team,
      });
    }

    if (!chat) {
      if (type === 'individual') {
        chat = new Chat({ type, participants: [senderId, receiverId], messages: [] });
      } else if (type === 'team') {
        chat = new Chat({ type, team, messages: [] });
      }
      await chat.save();
    }

    const message = { sender: senderId, content }; // Create a message object with content
    chat.messages.push(message); // Add the message object directly to the chat document
    await chat.save();

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getChatMessagesWithId = async (req, res) => {
  try {
    const { chatId } = req.params; // Assuming you're passing the chat ID as a URL parameter

    const chat = await Chat.findById(chatId).populate('messages');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get chat messages
exports.getChatMessagesWithoutId = async (req, res) => {
  try {
    const { senderId, receiverId, teamId } = req.body;

    let chat;
    if (teamId) {
      chat = await Chat.findOne({ team: teamId }).populate('messages');
    } else {
      chat = await Chat.findOne({
        type: 'individual',
        participants: { $all: [senderId, receiverId] }
      }).populate('messages');
    }

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get freelancer chats
exports.getFreelancerChats = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const chats = await Chat.find({ $or: [{ participants: freelancerId }, { team: freelancerId }] }).populate('participants team');
    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
