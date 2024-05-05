const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
  commenter: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: true }); 

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' }],
  timestamp: { type: Date, default: Date.now },
  comments: [commentSchema]
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
