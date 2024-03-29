var express = require("express");

const {

    getFreelancerChats,
    sendMessage,
    getChatMessagesWithId,
    getChatMessagesWithoutId,
} = require("../controllers/chat");

var router = express.Router();

router.route("/Chat/getChatMessages").get(getChatMessagesWithoutId);
router.route("/Chat/getChatMessagesWithId").get(getChatMessagesWithId);
router.route("/Chat/sendMessage").post(sendMessage);
router.route("/Chat/:id/getFreelancerChats").get(getFreelancerChats);

module.exports = router;