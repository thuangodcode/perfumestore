const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  YOB: Number,
  gender: {
    type: String,
    enum: ["Male", "Female", "LGBT", ""],
    default: ""
  },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Members', memberSchema);
