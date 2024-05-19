var express = require("express");

const {

    getFreelancerChats,
    sendMessage,
    getChatMessagesWithId,
    getChatMessagesWithoutId,
    markMessagesAsRead,
    getChatMessagesWithoutIdWeb,
} = require("../controllers/chat");

const { sendMessageFreelancerCompany, getChatMessagesFreelancerCompany,getFreelancerCompanyChats } = require('../controllers/freelancerCompanyChat');

var router = express.Router();

router.route("/Chat/getChatMessages").post(getChatMessagesWithoutId);
router.route("/Chat/getChatMessagesWeb").post(getChatMessagesWithoutIdWeb);
router.route("/Chat/:id/getChatMessagesWithId").get(getChatMessagesWithId);
router.route("/Chat/sendMessage").post(sendMessage);
router.route("/Chat/:id/getFreelancerChats").get(getFreelancerChats);
router.route('/Chat/markMessagesAsRead').post(markMessagesAsRead);
router.post('/chat/sendMessageFreelancerCompany', sendMessageFreelancerCompany);
router.post('/chat/getChatMessagesFreelancerCompany', getChatMessagesFreelancerCompany);
router.get('/chat/:userId/getFreelancerCompanyChats', getFreelancerCompanyChats);

module.exports = router;