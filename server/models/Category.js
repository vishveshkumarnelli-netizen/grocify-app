const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  emoji:       { type: String, default: '🛒' },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  color:       { type: String, default: '#d8f3dc' },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
