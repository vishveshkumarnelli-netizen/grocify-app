const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  emoji: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    orderNumber: { type: String, unique: true },

    items: [orderItemSchema],

    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      instructions: String,
    },

    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "cod", "wallet"],
      required: true,
    },

    paymentResult: {
      id: String,        // Razorpay payment ID
      orderId: String,   // Razorpay order ID
      status: String,
      updateTime: String,
      emailAddress: String,
    },

    deliverySlot: { type: String, default: "express" },

    itemsPrice: { type: Number, required: true, default: 0 },
    deliveryPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },

    couponCode: { type: String, default: "" },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    isPaid: { type: Boolean, default: false },
    paidAt: Date,

    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,

    estimatedDelivery: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

// 🔥 Safe Order Number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `GRF-${String(count + 1001).padStart(5, '0')}`;
  }
  next();
});

// 🔥 Indexes (performance)
orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);




// const mongoose = require('mongoose');

// const orderItemSchema = new mongoose.Schema({
//   product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//   name: { type: String, required: true },
//   emoji: { type: String },
//   price: { type: Number, required: true },
//   quantity: { type: Number, required: true },
//   unit: { type: String },
// });

// const orderSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   orderNumber: { type: String, unique: true },
//   items: [orderItemSchema],
//   shippingAddress: {
//     name: { type: String, required: true },
//     phone: { type: String, required: true },
//     street: { type: String, required: true },
//     city: { type: String, required: true },
//     state: { type: String, required: true },
//     pincode: { type: String, required: true },
//     instructions: String,
//   },
//   paymentMethod: {
//     type: String,
//     enum: ['upi', 'card', 'netbanking', 'cod', 'wallet'],
//     required: true,
//   },
//   paymentResult: {
//     id: String,
    
//     status: String,
//     updateTime: String,
//     emailAddress: String,
//   },
//   deliverySlot: { type: String, default: 'express' },
//   itemsPrice: { type: Number, required: true, default: 0 },
//   deliveryPrice: { type: Number, required: true, default: 0 },
//   discountAmount: { type: Number, default: 0 },
//   totalPrice: { type: Number, required: true, default: 0 },
//   couponCode: { type: String, default: '' },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'packing', 'out_for_delivery', 'delivered', 'cancelled'],
//     default: 'pending',
//   },

//   razorpayOrderId: String,
//   razorpayPaymentId: String,
//   razorpaySignature: String,
//   isPaid: { type: Boolean, default: false },
//   paidAt: Date,
//   isDelivered: { type: Boolean, default: false },
//   deliveredAt: Date,
//   estimatedDelivery: Date,
//   cancelledAt: Date,
// }, { timestamps: true });

// // Auto-generate order number
// orderSchema.pre('save', async function (next) {
//   if (!this.orderNumber) {
//     const count = await mongoose.model('Order').countDocuments();
//     this.orderNumber = `GRF-${String(count + 1001).padStart(5, '0')}`;
//   }
//   next();
// });

// module.exports = mongoose.model('Order', orderSchema);
