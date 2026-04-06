const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');

router.get('/', asyncHandler(async (req, res) => {
  const cats = await Category.find({ isActive: true }).sort('sortOrder');
  res.json({ success: true, categories: cats });
}));

router.post('/', protect, admin, asyncHandler(async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json({ success: true, category: cat });
}));

router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, category: cat });
}));

router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Category removed' });
}));

module.exports = router;
