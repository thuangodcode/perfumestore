const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const commentSchema = require('./Comment');

const perfumeSchema = new Schema({
  perfumeName: { type: String, required: true },
  uri: { type: String, required: true },
  price: { type: Number, required: true },
  concentration: { type: String, required: true }, // Extrait, EDP, EDT
  description: { type: String, required: true },
  ingredients: { type: String, required: true },
  volume: { type: Number, required: true },
  targetAudience: { type: String, required: true }, // male/female/unisex
  comments: [commentSchema],
  brand: { type: Schema.Types.ObjectId, ref: 'Brands', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Perfumes', perfumeSchema);
