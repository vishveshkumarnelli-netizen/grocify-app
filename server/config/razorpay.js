const Razorpay = require('razorpay');

let razorpay = null;

// Initialize Razorpay only if credentials are available
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id_here' &&
    process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret_here') {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

module.exports = razorpay;