const Post = require('../models/community');
const Freelancer = require('../models/freelancer');
const Company = require('../models/company');

// Create a post
exports.createPost = async (req, res) => {
    const { content, media = [] } = req.body;
    const user = req.freelancer || req.company;
    const userType = req.freelancer ? 'Freelancer' : 'Company';

    const newPost = Post({
        author: user._id,
        authorType: userType,
        content,
        media,
        likesType: userType,
    });

    try {
        const savedPost = await newPost.save();
        res.status(200).json({
            success: true,
            savedPost,
        });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create post', error });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().lean();
        
        const populatedPosts = await Promise.all(
            posts.map(async (post) => {
                if (post.authorType === 'Freelancer') {
                    post.author = await Freelancer.findById(post.author);
                } else {
                    post.author = await Company.findById(post.author);
                }

                post.likes = await Promise.all(
                    post.likes.map(async (like) => {
                        if (like.userType === 'Freelancer') {
                            like.user = await Freelancer.findById(like.user);
                        } else {
                            like.user = await Company.findById(like.user);
                        }
                        return like;
                    })
                );

                post.comments = await Promise.all(
                    post.comments.map(async (comment) => {
                        if (comment.commenterType === 'Freelancer') {
                            comment.commenter = await Freelancer.findById(comment.commenter);
                        } else {
                            comment.commenter = await Company.findById(comment.commenter);
                        }
                        return {
                            _id: comment._id,
                            commenter: comment.commenter,
                            commenterType: comment.commenterType,
                            content: comment.content,
                            timestamp: comment.timestamp
                        };
                    })
                );

                return post;
            })
        );

        res.status(200).json({
            success: true,
            posts: populatedPosts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};




// Like a post
exports.likePost = async (req, res) => {
    const postId = req.params.id;
    const currentUser = req.freelancer || req.company;
    const currentUserType = req.freelancer ? 'Freelancer' : 'Company';

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the current user has already liked the post
        const alreadyLiked = post.likes.some(
            like => like.user.equals(currentUser._id) && like.userType === currentUserType
        );

        if (!alreadyLiked) {
            post.likes.push({
                user: currentUser._id,
                userType: currentUserType
            });
            await post.save();
            res.status(200).json({ success: true, post });
        } else {
            res.status(400).json({ message: 'Already liked' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to like post', error });
    }
};



// Unlike a post
// Unlike a post
exports.unlikePost = async (req, res) => {
    const postId = req.params.id;
    const currentUser = req.freelancer || req.company;
    const currentUserType = req.freelancer ? 'Freelancer' : 'Company';

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Find the index of the like that matches the current user and type
        const likeIndex = post.likes.findIndex(
            like => like.user.equals(currentUser._id) && like.userType === currentUserType
        );

        if (likeIndex !== -1) {
            // Remove the like from the array
            post.likes.splice(likeIndex, 1);
            await post.save();
            res.status(200).json({ success: true, post });
        } else {
            res.status(400).json({ message: 'Not liked yet' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to unlike post', error });
    }
};



// // Delete a post
// exports.deletePost = async (req, res) => {
//     const postId = req.params.id;
//     try {
//         const post = await Post.findByIdAndDelete(postId);
//         res.status(200).json({ message: 'Post deleted successfully', post });
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to delete post', error });
//     }
// };


exports.addComment = async (req, res) => {
    const postId = req.params.postId;
    const { content } = req.body;
    const currentUser = req.freelancer || req.company;
    const commenterType = req.freelancer ? 'Freelancer' : 'Company';

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        post.comments.push({
            commenter: currentUser._id,
            commenterType: commenterType,
            content,
            timestamp: new Date(),
        });

        await post.save();
        res.status(201).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add comment', error });
    }
};



// Get comments for a post
exports.getPostWithComments = async (req, res) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId)
            .populate('author')
            .populate('comments.commenter');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get post', error });
    }
};


// Delete a post
exports.deletePost = async (req, res) => {
    const postId = req.params.id;
    const currentUser = req.freelancer || req.company;
    const currentUserType = req.freelancer ? 'Freelancer' : 'Company';

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the current user is the author
        if (post.author.equals(currentUser._id) && post.authorType === currentUserType) {
            await post.deleteOne();
            res.status(200).json({ success: true, message: 'Post deleted successfully' });
        } else {
            res.status(403).json({ message: 'Not authorized to delete this post' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete post', error });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const currentUser = req.freelancer || req.company;
    const currentUserType = req.freelancer ? 'Freelancer' : 'Company';

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if the current user is the commenter
        if (comment.commenter.equals(currentUser._id) && comment.commenterType === currentUserType) {
            comment.deleteOne();
            await post.save();
            res.status(200).json({ success: true, message: 'Comment deleted successfully', post });
        } else {
            res.status(403).json({ message: 'Not authorized to delete this comment' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete comment', error });
    }
};


// Follow a freelancer or company
exports.followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.freelancer || req.company;
        const currentUserType = req.freelancer ? 'Freelancer' : 'Company';

        // Determine the type of user to follow
        let userToFollow = await Freelancer.findById(userId);
        let userTypeToFollow = 'Freelancer';
        if (!userToFollow) {
            userToFollow = await Company.findById(userId);
            userTypeToFollow = 'Company';
        }

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent self-following
        if (currentUser._id.equals(userToFollow._id)) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        // Check if already following
        if (currentUser.following.includes(userId)) {
            return res.status(400).json({ message: 'Already following' });
        }

        // Add to followers and following
        userToFollow.followers.push({ _id: currentUser._id, type: currentUserType });
        currentUser.following.push({ _id: userToFollow._id, type: userTypeToFollow });

        await userToFollow.save();
        await currentUser.save();

        res.status(200).json({ success: true, message: 'Followed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to follow user', error });
    }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.freelancer || req.company;
        const currentUserType = req.freelancer ? 'Freelancer' : 'Company';

        // Determine the type of user to unfollow
        let userToUnfollow = await Freelancer.findById(userId);
        let userTypeToUnfollow = 'Freelancer';
        if (!userToUnfollow) {
            userToUnfollow = await Company.findById(userId);
            userTypeToUnfollow = 'Company';
        }

        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already not following
        if (!currentUser.following.includes(userId)) {
            return res.status(400).json({ message: 'Not following' });
        }

        // Remove from followers and following
        userToUnfollow.followers.pull({ _id: currentUser._id, type: currentUserType });
        currentUser.following.pull({ _id: userToUnfollow._id, type: userTypeToUnfollow });

        await userToUnfollow.save();
        await currentUser.save();

        res.status(200).json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to unfollow user', error });
    }
};
