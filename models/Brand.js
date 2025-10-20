const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const brandSchema = new Schema({
  brandName: { type: String, required: true, unique: true },
}, { timestamps: true });

// ✅ Tạo index unique case-insensitive
brandSchema.index({ brandName: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model('Brands', brandSchema);
