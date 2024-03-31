var express = require("express");

const {

    getFreelancerChats,
    sendMessage,
    getChatMessagesWithId,
    getChatMessagesWithoutId,
    markMessagesAsRead,
    getChatMessagesWithoutIdWeb
} = require("../controllers/chat");

var router = express.Router();

router.route("/Chat/getChatMessages").post(getChatMessagesWithoutId);
router.route("/Chat/getChatMessagesWeb").post(getChatMessagesWithoutIdWeb);
router.route("/Chat/:id/getChatMessagesWithId").get(getChatMessagesWithId);
router.route("/Chat/sendMessage").post(sendMessage);
router.route("/Chat/:id/getFreelancerChats").get(getFreelancerChats);
router.route('/Chat/markMessagesAsRead').post(markMessagesAsRead);


module.exports = router;