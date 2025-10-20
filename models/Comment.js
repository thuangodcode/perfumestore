const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  rating: { type: Number, min: 1, max: 3, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'Collectors', required: true } // ⚡ sửa ref
}, { timestamps: true });

module.exports = commentSchema; // export schema để nhúng
