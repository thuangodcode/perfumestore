// models/Collector.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectorSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: function() {
      // Chỉ required khi không dùng Google login
      return this.authProvider !== 'google';
    }
  },
  name: { type: String },
  YOB: Number,
  gender: {
    type: String,
    enum: ["Male", "Female", "LGBT", ""],
    default: ""
  },
  
  // ===== Google OAuth fields =====
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Cho phép null và vẫn giữ unique
  },
  avatar: {
    type: String,
    default: null,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  // ================================
  
  isAdmin: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deleteReason: { type: String, default: '' },
}, { timestamps: true });

// Index để tối ưu query
collectorSchema.index({ email: 1 });
collectorSchema.index({ googleId: 1 });

module.exports = mongoose.model('Collectors', collectorSchema);