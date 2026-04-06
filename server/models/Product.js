const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  originalPrice:{ type: Number, default: null },
  unit:        { type: String, required: true }, // "per kg", "per dozen"
  emoji:       { type: String, default: '🥦' },
  image:       { type: String, default: '' },
  images:      [{ type: String }],
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  tags:        [{ type: String }],
  badge:       { type: String, enum: ['sale', 'new', 'best', 'organic', null], default: null },
  stock:       { type: Number, required: true, default: 0 },
  sold:        { type: Number, default: 0 },
  isFeatured:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  reviews:     [reviewSchema],
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 },
  nutritionInfo: {
    calories:  String,
    protein:   String,
    carbs:     String,
    fat:       String,
    fiber:     String,
  },
}, { timestamps: true });

// Update rating on review add
productSchema.pre('save', function (next) {
  if (this.reviews.length > 0) {
    this.rating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
