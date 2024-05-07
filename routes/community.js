const express = require('express');


const {
    createPost,
    getAllPosts,
    likePost,
    unlikePost,
    deletePost,
    addComment,
    getPostWithComments,
    deleteComment,
    followUser,
    unfollowUser
} = require("../controllers/community");

const { isAuthenticated, isCompanyAuthenticated } = require("../middlewares/auth");

var router = express.Router();


// Post routes
router.route('/community/createPost').post(isAuthenticated,isCompanyAuthenticated,createPost);
router.route('/community/getPosts').get(getAllPosts);
router.route('/community/:id/likePost').post(isAuthenticated,isCompanyAuthenticated, likePost);
router.route('/community/:id/unlikePost').post(isAuthenticated,isCompanyAuthenticated,unlikePost);
router.route('/community/:id/deletePost').delete(isAuthenticated,isCompanyAuthenticated,deletePost);

// Comment routes
router.route('/community/:postId/addComment').post(isAuthenticated,isCompanyAuthenticated, addComment);
router.route('/community/:postId').get(getPostWithComments);
router.route('/community/:postId/comments/:commentId/delete').delete(isAuthenticated,isCompanyAuthenticated,deleteComment);

// Follow routes
router.route('/community/:userId/follow').post(isAuthenticated,isCompanyAuthenticated, followUser);
router.route('/community/:userId/unfollow').post(isAuthenticated,isCompanyAuthenticated, unfollowUser);

module.exports = router;
