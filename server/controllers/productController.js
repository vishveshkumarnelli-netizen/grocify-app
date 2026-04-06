const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc  Get all products
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page     = Number(req.query.page) || 1;

  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.badge)    filter.badge    = req.query.badge;
  if (req.query.featured) filter.isFeatured = true;
  if (req.query.search) {
    filter.$or = [
      { name:        { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { tags:        { $in: [new RegExp(req.query.search, 'i')] } },
    ];
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  const sortOptions = {
    popular: { sold: -1 },
    rating:  { rating: -1 },
    newest:  { createdAt: -1 },
    'price-asc':  { price:  1 },
    'price-desc': { price: -1 },
  };
  const sort = sortOptions[req.query.sort] || { sold: -1 };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name slug emoji color')
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc  Get single product by slug or id
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [{ slug: req.params.id }, { _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null }],
    isActive: true,
  }).populate('category', 'name slug emoji color');

  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
});

// @desc  Create product review
// @route POST /api/products/:id/reviews
// @access Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const already = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (already) { res.status(400); throw new Error('You already reviewed this product'); }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  await product.save();
  res.status(201).json({ success: true, message: 'Review added' });
});

// @desc  Create product (admin)
// @route POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @desc  Update product (admin)
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
});

// @desc  Delete product (admin)
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Product removed' });
});

module.exports = { getProducts, getProductById, createProductReview, createProduct, updateProduct, deleteProduct };
