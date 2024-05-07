const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'likes.userType' },
  userType: { type: String, required: true, enum: ["Freelancer", "Company"] }
});

const commentSchema = new mongoose.Schema({
  commenter: { type: mongoose.Schema.Types.ObjectId, refPath: 'comments.commenterType', required: true },
  commenterType: { type: String, required: true, enum: ["Freelancer", "Company"] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, refPath: 'authorType', required: true },
  authorType: { type: String, required: true, enum: ["Freelancer", "Company"] },
  content: { type: String, required: true },
  media: [{ type: String }],
  likes: [likeSchema],
  timestamp: { type: Date, default: Date.now },
  comments: [commentSchema]
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
