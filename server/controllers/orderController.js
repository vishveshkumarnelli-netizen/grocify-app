const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// @route POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, deliverySlot, couponCode } = req.body;

  if (!items?.length) {
    res.status(400);
    throw new Error("No order items");
  }

  // 🔹 Calculate items
  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    itemsPrice += product.price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      emoji: product.emoji,
      price: product.price,
      quantity: item.quantity,
      unit: product.unit,
    });
  }


  // ✅ 2. DELIVERY LOGIC (FIXED)
  let deliveryPrice = 0;

  if (deliverySlot === "express") {
    deliveryPrice = 60;
  } else {
    deliveryPrice = itemsPrice >= 500 ? 0 : 40;
  }

  // ✅ 3. COUPON LOGIC (WITH CONDITIONS)
  let discountAmount = 0;
  const code = couponCode?.toUpperCase();

  if (code === "FIRST50") {
    discountAmount = 50;
  }

  if (code === "SAVE100") {
    if (itemsPrice >= 500) {
      discountAmount = 100;
    }
  }

  if (code === "WKND20") {
    discountAmount = Math.round(itemsPrice * 0.2);
  }

  // ✅ 4. FINAL TOTAL
  const totalPrice = Math.max(itemsPrice + deliveryPrice - discountAmount, 0);

  // 🔹 Delivery Logic (MATCH FRONTEND)
  // const deliveryPrice =
  //   deliverySlot === "express"
  //     ? 0
  //     : itemsPrice >= 500
  //     ? 0
  //     : 40;

  // 🔹 Coupons
  // let discountAmount = 0;
  // if (couponCode === "FIRST50") discountAmount = 50;
  // else if (couponCode === "WKND20") discountAmount = Math.round(itemsPrice * 0.2);
  // else if (couponCode === "SAVE100") discountAmount = itemsPrice >= 800 ? 100 : 0;

  // const totalPrice = itemsPrice + deliveryPrice - discountAmount;

  // 🔹 Razorpay Order (only for online)
  let razorpayOrder = null;

  if (paymentMethod !== "cod") {
    if (!razorpay) {
      res.status(500);
      throw new Error("Payment gateway not configured");
    }
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: totalPrice * 100, // Razorpay expects amount in paisa
        currency: 'INR',
        receipt: `order_${Date.now()}`, // Temporary receipt
        payment_capture: 1, // Auto capture
      });
    } catch (error) {
      res.status(500);
      throw new Error('Payment gateway error: ' + error.message);
    }
  }
    // razorpayOrder = await razorpay.orders.create({
    //   amount: totalPrice * 100,
    //   currency: "INR",
    //   receipt: `order_${Date.now()}`,
    //   payment_capture: 1,
    // });


  // 🔹 Create Order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    deliverySlot: deliverySlot || "express",
    itemsPrice,
    deliveryPrice,
    discountAmount,
    totalPrice,
    couponCode: couponCode || "",
    estimatedDelivery: new Date(
      Date.now() + (deliverySlot === "express" ? 60 : 180) * 60 * 1000
    ),
    paymentResult: razorpayOrder ? { orderId: razorpayOrder.id } : {},
  });

  // 🔹 COD → confirm immediately
  if (paymentMethod === "cod") {
    order.status = "confirmed";
    await order.save();
  }

  // 🔹 Update Stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  const populated = await Order.findById(order._id).populate(
    "items.product",
    "name emoji"
  );

  res.status(201).json({
    success: true,
    order: populated,
    razorpayOrder: razorpayOrder
      ? {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        }
      : null,
  });
});


// @route POST /api/orders/verify-payment
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed");
  }

  const order = await Order.findOne({
    "paymentResult.orderId": razorpay_order_id,
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = "confirmed";

  order.paymentResult = {
    id: razorpay_payment_id,
    status: "paid",
    updateTime: new Date().toISOString(),
  };

  await order.save();
  // ✅ NOW update stock (SAFE)
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  res.json({ success: true, order });
});


// @route GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("items.product", "name emoji");

  res.json({ success: true, orders });
});


// @route GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.product", "name emoji");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  res.json({ success: true, order });
});


// @route PUT /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    order.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (order.status === "delivered") {
    res.status(400);
    throw new Error("Delivered order cannot be cancelled");
  }

  if (order.status === "cancelled") {
    res.status(400);
    throw new Error("Already cancelled");
  }

  order.status = "cancelled";
  order.cancelledAt = Date.now();

  await order.save();

  res.json({ success: true, message: "Order cancelled", order });
});


// @route PUT /api/orders/:id/status (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({ success: true, order });
});


// @route GET /api/orders (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});


module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
};



// const asyncHandler = require('express-async-handler');
// const Order = require('../models/Order');
// const Product = require('../models/Product');
// const razorpay = require("../config/razorpay");


// // @route POST /api/orders
// const createOrder = asyncHandler(async (req, res) => {
//   const { items, shippingAddress, paymentMethod, deliverySlot, couponCode } = req.body;
//   if (!items?.length) { res.status(400); throw new Error('No order items'); }

//   // Recalculate prices server-side
//   let itemsPrice = 0;
//   const orderItems = [];
//   for (const item of items) {
//     const product = await Product.findById(item.product);
//     if (!product) { res.status(404); throw new Error(`Product ${item.product} not found`); }
//     if (product.stock < item.quantity) { res.status(400); throw new Error(`Insufficient stock for ${product.name}`); }
//     itemsPrice += product.price * item.quantity;
//     orderItems.push({ product: product._id, name: product.name, emoji: product.emoji, price: product.price, quantity: item.quantity, unit: product.unit });
//   }

//   const deliveryPrice = itemsPrice >= 500 ? 0 : 40;
//   const discountAmount = couponCode === 'FIRST50' ? 50 : couponCode === 'WKND20' ? Math.round(itemsPrice * 0.2) : 0;
//   const totalPrice = itemsPrice + deliveryPrice - discountAmount;

//   const order = await Order.create({
//     user: req.user._id,
//     items: orderItems,
//     shippingAddress,
//     paymentMethod,
//     deliverySlot: deliverySlot || 'express',
//     itemsPrice,
//     deliveryPrice,
//     discountAmount,
//     totalPrice,
//     couponCode: couponCode || '',
//     estimatedDelivery: new Date(Date.now() + (deliverySlot === 'express' ? 60 : 180) * 60 * 1000),
//   });

//   // Update stock
//   for (const item of orderItems) {
//     await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, sold: item.quantity } });
//   }

//   const populated = await Order.findById(order._id).populate('items.product', 'name emoji');
//   res.status(201).json({ success: true, order: populated });
// });

// // @route GET /api/orders/my
// const getMyOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('items.product', 'name emoji');
//   res.json({ success: true, orders });
// });

// // @route GET /api/orders/:id
// const getOrderById = asyncHandler(async (req, res) => {
//   const order = await Order.findById(req.params.id).populate('user', 'name email').populate('items.product', 'name emoji');
//   if (!order) { res.status(404); throw new Error('Order not found'); }
//   if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
//     res.status(403); throw new Error('Not authorized');
//   }
//   res.json({ success: true, order });
// });

// // @route PUT /api/orders/:id/pay
// const updateOrderToPaid = asyncHandler(async (req, res) => {
//   const order = await Order.findById(req.params.id);
//   if (!order) { res.status(404); throw new Error('Order not found'); }
//   order.isPaid = true;
//   order.paidAt = Date.now();
//   order.status = 'confirmed';
//   order.paymentResult = req.body;
//   await order.save();
//   res.json({ success: true, order });
// });

// // @route PUT /api/orders/:id/status (admin)
// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
//   if (!order) { res.status(404); throw new Error('Order not found'); }
//   res.json({ success: true, order });
// });

// // @route GET /api/orders (admin)
// const getAllOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
//   res.json({ success: true, orders });
// });


// // @route PUT /api/orders/:id/cancel
// const cancelOrder = asyncHandler(async (req, res) => {
//   const order = await Order.findById(req.params.id);

//   if (!order) {
//     res.status(404);
//     throw new Error("Order not found");
//   }

//   // 🔒 Only owner OR admin can cancel
//   if (
//     order.user.toString() !== req.user._id.toString() &&
//     req.user.role !== "admin"
//   ) {
//     res.status(403);
//     throw new Error("Not authorized to cancel this order");
//   }

//   // ❌ Prevent cancelling after delivery
//   if (order.status === "delivered") {
//     res.status(400);
//     throw new Error("Delivered order cannot be cancelled");
//   }

//   // ❌ Prevent duplicate cancel
//   if (order.status === "cancelled") {
//     res.status(400);
//     throw new Error("Order already cancelled");
//   }

//   // ✅ Cancel order
//   order.status = "cancelled";
//   order.cancelledAt = Date.now();

//   await order.save();

//   res.json({
//     success: true,
//     message: "Order cancelled successfully",
//     order,
//   });
// });

// module.exports = { createOrder, getMyOrders, getOrderById, updateOrderToPaid, updateOrderStatus, getAllOrders, cancelOrder, };
