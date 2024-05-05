const express = require('express');


const {
    createPost,
    getAllPosts,
    likePost,
    deletePost,
    addComment,
    getPostWithComments,
    deleteComment,
    followFreelancer,
    unfollowFreelancer
} = require("../controllers/community");

const { isAuthenticated } = require("../middlewares/auth");

var router = express.Router();


// Post routes
router.route('/community/createPost').post(isAuthenticated,createPost);
router.route('/community/getPosts').get(getAllPosts);
router.route('/community/:id/likePost').post(isAuthenticated,likePost);
router.route('/community/:id/deletePost').delete(deletePost);

// Comment routes
router.route('/community/:postId/addComment').post(isAuthenticated, addComment);
router.route('/community/:postId').get(getPostWithComments);
router.route('/community/:postId/comments/:commentId/delete').delete(deleteComment);

// Follow routes
router.route('/community/:freelancerId/follow').post(isAuthenticated, followFreelancer);
router.route('/community/:freelancerId/unfollow').post(isAuthenticated, unfollowFreelancer);

module.exports = router;
