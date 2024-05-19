const { FreelancerCompanyChat, FreelancerCompanyMessage } = require("../models/freelancerCompanyChat");
const Company = require('../models/company');
const Freelancer = require('../models/freelancer');

exports.sendMessageFreelancerCompany = async (req, res) => {
  try {
    const { senderId, receiverId, content, fileUrl, fileType, senderModel, receiverModel } = req.body;
    let chat = await FreelancerCompanyChat.findOne({
      participants: { $all: [senderId, receiverId] },
      participantModels: { $all: [senderModel, receiverModel] }
    });

    if (!chat) {
      chat = new FreelancerCompanyChat({
        type: 'individual',
        participants: [senderId, receiverId],
        participantModels: [senderModel, receiverModel],
        messages: []
      });
      await chat.save();
    }

    const message = { sender: senderId, content, fileUrl, fileType, senderModel };
    chat.messages.push(message);
    await chat.save();

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getChatMessagesFreelancerCompany = async (req, res) => {
  try {
    const { senderId, receiverId, senderModel, receiverModel } = req.body;

    const chat = await FreelancerCompanyChat.findOne({
      participants: { $all: [senderId, receiverId] },
      participantModels: { $all: [senderModel, receiverModel] }
    }).populate('messages');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getFreelancerCompanyChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.body; // Pass userType in body

    if (userType === 'company') {
      const company = await Company.findById(userId);
      if (!company) {
        return res.status(404).json({ success: false, message: "Company not found" });
      }

      const chats = await FreelancerCompanyChat.find({
        type: "individual",
        participants: { $in: [userId] }
      }).populate("participants");

      res.status(200).json({ success: true, chats });
    } else if (userType === 'freelancer') {
      const freelancer = await Freelancer.findById(userId);
      if (!freelancer) {
        return res.status(404).json({ success: false, message: "Freelancer not found" });
      }

      const chats = await FreelancerCompanyChat.find({
        type: "individual",
        participants: { $in: [userId] }
      }).populate("participants");

      res.status(200).json({ success: true, chats });
    } else {
      return res.status(400).json({ success: false, message: "Invalid user type" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
