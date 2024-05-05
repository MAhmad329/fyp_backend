
const Post = require('../models/community');
const Freelancer = require('../models/freelancer');
// Create a post
exports.createPost = async (req, res) => {
    const { content } = req.body;
    
    const freelancer = req.freelancer._id;

  const newPost =  Post({
    author: freelancer, // Assuming user ID comes from authenticated session
    content
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

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author');
    res.status(200).json({
      success: true,
      posts,
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
  const userId = req.freelancer._id; // Assuming user ID comes from authenticated session

  try {
    const post = await Post.findById(postId);
    if (post.likes.includes(userId)) {
      // If already liked, unlike it
      post.likes.pull(userId);
    } else {
      // Else, like the post
      post.likes.push(userId);
    }
    await post.save();
    res.status(200).json({
    success: true,
    post,
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to like/unlike post', error });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post', error });
  }
};

exports.addComment = async (req, res) => {
  const postId = req.params.postId;
  const { content } = req.body;
  const commenterId = req.freelancer._id; // Assuming this is set from authentication middleware

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    // Adding the new comment to the comments array
    post.comments.push({
      commenter: commenterId,
      content,
      timestamp: new Date()
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error });
  }
};


// Get comments for a post
exports.getPostWithComments = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId).populate('author').populate('comments.commenter');
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get post', error });
  }
};


// Delete a comment
exports.deleteComment = async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    comment.deleteOne();
    await post.save();
    res.status(200).json({ message: 'Comment deleted successfully', post });
  } catch (error) {
    console.error("Error when deleting comment:", error); // Log error to the console for debugging
    res.status(500).json({ message: 'Failed to remove comment', error: error.message });
  }
};

exports.followFreelancer = async (req, res) => {
    try {
        const { freelancerId } = req.params;
        const currentFreelancer = req.freelancer._id;

        const freelancerToFollow = await Freelancer.findById(freelancerId);
        const currentFreelancerData = await Freelancer.findById(currentFreelancer);

        if (!freelancerToFollow || !currentFreelancerData) {
            return res.status(404).json({ message: 'Freelancer not found' });
        }

        if (currentFreelancerData.following.includes(freelancerId)) {
            return res.status(400).json({ message: 'Already following' });
        }

        freelancerToFollow.followers.push(currentFreelancer);
        currentFreelancerData.following.push(freelancerId);

        await freelancerToFollow.save();
        await currentFreelancerData.save();

        res.status(200).json({ success: true, message: 'Followed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to follow freelancer', error });
    }
};

// Unfollow a freelancer
exports.unfollowFreelancer = async (req, res) => {
    try {
        const { freelancerId } = req.params;
        const currentFreelancer = req.freelancer._id;

        const freelancerToUnfollow = await Freelancer.findById(freelancerId);
        const currentFreelancerData = await Freelancer.findById(currentFreelancer);

        if (!freelancerToUnfollow || !currentFreelancerData) {
            return res.status(404).json({ message: 'Freelancer not found' });
        }

        if (!currentFreelancerData.following.includes(freelancerId)) {
            return res.status(400).json({ message: 'Not following' });
        }

        freelancerToUnfollow.followers.pull(currentFreelancer);
        currentFreelancerData.following.pull(freelancerId);

        await freelancerToUnfollow.save();
        await currentFreelancerData.save();

        res.status(200).json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to unfollow freelancer', error });
    }
};
