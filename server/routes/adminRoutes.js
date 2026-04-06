const express = require('express');
const router  = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/auth');
const Product  = require('../models/Product');
const Order    = require('../models/Order');
const User     = require('../models/User');
const Category = require('../models/Category');

// ── DASHBOARD STATS ──────────────────────────────────────────
// GET /api/admin/stats
router.get('/stats', protect, admin, asyncHandler(async (req, res) => {
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    totalCategories,
    revenueAgg,
    ordersByStatus,
    lowStockProducts,
    recentOrders,
    topProducts,
    monthlySales,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Category.countDocuments({ isActive: true }),

    // Total revenue from delivered/paid orders
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),

    // Orders by status
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Low stock (< 20 units)
    Product.find({ stock: { $lt: 20 }, isActive: true })
      .select('name emoji stock')
      .sort({ stock: 1 })
      .limit(5),

    // 6 most recent orders
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6),

    // Top 5 products by sold count
    Product.find({ isActive: true })
      .select('name emoji price sold category')
      .populate('category', 'name')
      .sort({ sold: -1 })
      .limit(5),

    // Monthly revenue for current year
    Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      },
      {
        $group: {
          _id:     { month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
  const statusMap    = ordersByStatus.reduce((m, s) => ({ ...m, [s._id]: s.count }), {});

  // Month labels
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData = MONTHS.map((label, i) => {
    const found = monthlySales.find(m => m._id.month === i + 1);
    return { label, revenue: found?.revenue || 0, orders: found?.orders || 0 };
  });

  res.json({
    success: true,
    stats: {
      totalProducts,
      totalOrders,
      totalUsers,
      totalCategories,
      totalRevenue,
      statusMap,
      lowStockProducts,
      recentOrders,
      topProducts,
      monthlyData,
    },
  });
}));

// ── BULK PRODUCT ACTIONS ──────────────────────────────────────
// PATCH /api/admin/products/bulk
router.patch('/products/bulk', protect, admin, asyncHandler(async (req, res) => {
  const { action, ids } = req.body;
  if (!ids?.length) { res.status(400); throw new Error('No IDs provided'); }

  if (action === 'delete') {
    await Product.updateMany({ _id: { $in: ids } }, { isActive: false });
  } else if (action === 'feature') {
    await Product.updateMany({ _id: { $in: ids } }, { isFeatured: true });
  } else if (action === 'unfeature') {
    await Product.updateMany({ _id: { $in: ids } }, { isFeatured: false });
  } else {
    res.status(400); throw new Error('Invalid action');
  }

  res.json({ success: true, message: `Bulk ${action} applied to ${ids.length} products` });
}));

// ── ORDER STATUS UPDATE (admin shortcut) ─────────────────────
// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', protect, admin, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status, ...(status === 'delivered' ? { isDelivered: true, deliveredAt: Date.now() } : {}) },
    { new: true }
  ).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  res.json({ success: true, order });
}));

module.exports = router;
