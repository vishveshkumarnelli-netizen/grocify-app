import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiClock,
  FiCreditCard,
  FiTag,
  FiLock,
  
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useCartStore, useAuthStore } from "../context/store";
import { createOrder, verifyPayment } from "../services/api";


const SLOTS = [
  { id: "express", label: "⚡ Express (60 min)", price: 60, free: false },
  { id: "morning", label: "🌅 Morning (8–10 AM)", price: 0, free: true },
  { id: "afternoon", label: "🌞 Afternoon (12–2 PM)", price: 0, free: true },
  { id: "evening", label: "🌆 Evening (6–8 PM)", price: 0, free: true },
];

const PAY_METHODS = [
  { id: "upi", label: "📱 UPI / PhonePe / GPay" },
  { id: "card", label: "💳 Credit / Debit Card" },
  { id: "netbanking", label: "🏦 Net Banking" },
  { id: "cod", label: "💵 Cash on Delivery" },
  { id: "wallet", label: "👜 Paytm Wallet" },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();

  // const deliveryFee = cartTotal >= 500 ? 0 : 40
  
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "",
    instructions: "",
  });
// ✅ 1. STATE (always first)
const [slot, setSlot] = useState("express");
const [coupon, setCoupon] = useState("");
const [discount, setDiscount] = useState(0);

// ✅ 2. CART TOTAL
const cartTotal = items.reduce((s, i) => s + i.price * i.qty, 0);

// ✅ 3. DELIVERY LOGIC (👉 ADD YOUR CODE HERE)
const deliveryFee =
  slot === "express"
    ? 60
    : cartTotal >= 500
    ? 0
    : 40;

// ✅ 4. TOTAL PRICE
const totalPrice = cartTotal + deliveryFee - discount;
  const [payMethod, setPayMethod] = useState("upi");

  
  
  const [couponMsg, setCouponMsg] = useState("");
  const [placing, setPlacing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // const COUPONS = {
  //   FIRST50: 50,
  //   WKND20: Math.round(cartTotal * 0.2),
  //   SAVE100: 100,
  // };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => toast.error("Failed to load payment gateway");
    document.body.appendChild(script);
  }, []);

  const handleInput = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

   const applyCoupon = () => {
    if (!coupon) {
      setDiscount(0);
      setCouponMsg("❌ Enter a coupon code");
      return;
    }

    const code = coupon.toUpperCase();

    if (code === "FIRST50") {
      setDiscount(50);
      setCouponMsg("✅ ₹50 discount applied");
      toast.success("₹50 OFF applied!");
      return;
    }

    if (code === "SAVE100") {
      if (cartTotal >= 500) {
        setDiscount(100);
        setCouponMsg("✅ ₹100 discount applied");
        toast.success("₹100 OFF applied!");
      } else {
        setDiscount(0);
        setCouponMsg("❌ Minimum ₹800 required");
      }
      return;
    }

    if (code === "WKND20") {
      const val = Math.round(cartTotal * 0.2);
      setDiscount(val);
      setCouponMsg(`✅ 20% OFF (₹${val})`);
      toast.success("20% OFF applied!");
      return;
    }

    // ❌ Invalid
    setDiscount(0);
    setCouponMsg("❌ Invalid coupon code");
  };

  // const applyCoupon = () => {
  //   const val = COUPONS[coupon.toUpperCase()];
  //   if (val) {
  //     setDiscount(val);
  //     setCouponMsg(`✅ Coupon applied! You saved ₹${val}`);
  //     toast.success(`Coupon applied – ₹${val} off!`);
  //   } else {
  //     setDiscount(0);
  //     setCouponMsg("❌ Invalid coupon code");
  //   }
  // };

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.street || !form.pincode) {
      toast.error("Please fill in all delivery fields");
      return;
    }
    setPlacing(true);
    try {
      const orderData = {
        items: items.map((i) => ({ product: i._id, quantity: i.qty })),
        shippingAddress: {
          name: form.name,
          phone: form.phone,
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          instructions: form.instructions,
        },
        paymentMethod: payMethod,
        deliverySlot: slot,
        couponCode: coupon.toUpperCase(),
      };
      const data = await createOrder(orderData);

      if (payMethod === "cod") {
        // For COD, directly navigate to success
        clearCart();
        navigate(`/order-success/${data.order._id}`);
      } else {
        // For online payments, initiate Razorpay
        if (!razorpayLoaded || !window.Razorpay) {
          toast.error(
            "Payment gateway not loaded. Please refresh and try again.",
          );
          return;
        }

        const options = {
          key: "rzp_test_SYUF1DM8iTbMk6", // You'll need to add this to your env
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: "Grocify",
          description: `Order #${data.order.orderNumber}`,
          order_id: data.razorpayOrder.id,
          handler: async function (response) {
            try {
              // Verify payment on server
              await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              clearCart();
              navigate(`/order-success/${data.order._id}`);
            } catch (error) {
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            name: form.name,
            email: user?.email || "",
            contact: form.phone,
          },
          theme: {
            color: "#16a34a", // forest green
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0)
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="font-bold text-xl mb-3">Your cart is empty</h2>
        <Link to="/shop" className="btn-primary inline-flex px-7 py-3">
          Browse Shop
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-7">
        <Link to="/" className="hover:text-forest-600 font-medium">
          Home
        </Link>{" "}
        ›<span className="text-gray-700 font-medium">Checkout</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_380px] gap-7">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
              <FiMapPin className="text-forest-600" /> Delivery Address
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  className="input-base"
                  placeholder="Priya Sharma"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleInput}
                  className="input-base"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Street Address *
                </label>
                <input
                  name="street"
                  value={form.street}
                  onChange={handleInput}
                  className="input-base"
                  placeholder="Flat no., Building, Street, Area"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleInput}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Pincode *
                </label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleInput}
                  className="input-base"
                  placeholder="380054"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Delivery Instructions
                </label>
                <input
                  name="instructions"
                  value={form.instructions}
                  onChange={handleInput}
                  className="input-base"
                  placeholder="Leave at door, call on arrival…"
                />
              </div>
            </div>
          </div>

          {/* Delivery Slot */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
              <FiClock className="text-forest-600" /> Delivery Time Slot
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {SLOTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSlot(s.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${slot === s.id ? "border-forest-500 bg-forest-50" : "border-gray-200 hover:border-forest-200"}`}
                >
                  <div className="font-semibold text-sm text-gray-800">
                    {s.label}
                  </div>
                  <div
                    className={`text-xs font-bold mt-1 ${s.free ? "text-green-600" : "text-amber-500"}`}
                  >
                    {/* {s.price}  */}
                    {/* /* {s.free ? "FREE" : `₹${s.price}`} */ */}
                    {s.id === "express"
                      ? "₹60"
                      : cartTotal >= 500
                        ? "FREE"
                        : "₹40"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
              <FiCreditCard className="text-forest-600" /> Payment Method
            </h2>
            <div className="space-y-2 mb-4">
              {PAY_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all ${payMethod === m.id ? "border-forest-500 bg-forest-50 text-forest-700" : "border-gray-200 hover:border-forest-200 text-gray-700"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── ORDER SUMMARY ── */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6    sticky top-24">
            <h2 className="font-display text-xl font-bold mb-5 pb-4 border-b border-gray-100">
              Order Summary
            </h2>


            {/* Items */}
            <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-3">
              {" "}
              {/* scrollbar padding */}
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">×{item.qty}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-800 shrink-0">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <FiTag
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                  className="input-base pl-9 text-sm py-2.5"
                  placeholder="Coupon code"
                />
              </div>
              <button
                onClick={applyCoupon}
                className="bg-forest-600 hover:bg-forest-500 text-white px-4 rounded-xl text-sm font-semibold transition-colors"
              >
                Apply
              </button>
            </div>
            {couponMsg && (
              <p
                className={`text-xs mb-3 font-medium ${discount > 0 ? "text-green-600" : "text-red-500"}`}
              >
                {couponMsg}
              </p>
            )}
           
            

            {/* Totals */}
            <div className="border-t border-gray-100 pt-4 space-y-2.5 pr-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span
                  className={
                    deliveryFee === 0 ? "text-green-600 font-semibold" : ""
                  }
                >
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>−₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="font-display text-forest-700 text-xl">
                  ₹{totalPrice}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="mt-5 w-full bg-forest-600 hover:bg-forest-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
            >
              {placing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Placing Order…
                </>
              ) : (
                <>🎉 Place Order · ₹{totalPrice}</>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
              <FiLock size={11} /> Secured by SSL Encryption
            </div>

            {/* Available coupons hint */}
            <div className="mt-4 bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
              <div className="font-bold mb-1">Available Coupons:</div>
              <div>
                • <strong>FIRST50</strong> – ₹50 off first order
              </div>
              <div>
                • <strong>WKND20</strong> – 20% weekend offer
              </div>
              <div>
                • <strong>SAVE100</strong> – ₹100 off on ₹800+
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { FiMapPin, FiClock, FiCreditCard, FiTag, FiLock, FiChevronDown } from 'react-icons/fi'
// import toast from 'react-hot-toast'
// import { useCartStore, useAuthStore } from '../context/store'
// import { createOrder } from '../services/api'

// const SLOTS = [
//   { id:'express',   label:'⚡ Express (60 min)',    price:'₹60',  free: false },
//   { id:'morning',   label:'🌅 Morning (8–10 AM)',   price:'FREE', free: true  },
//   { id:'afternoon', label:'🌞 Afternoon (12–2 PM)', price:'FREE', free: true  },
//   { id:'evening',   label:'🌆 Evening (6–8 PM)',    price:'FREE', free: true  },
// ]

// const PAY_METHODS = [
//   { id:'upi',        label:'📱 UPI / PhonePe / GPay' },
//   { id:'card',       label:'💳 Credit / Debit Card' },
//   { id:'netbanking', label:'🏦 Net Banking' },
//   { id:'cod',        label:'💵 Cash on Delivery' },
//   { id:'wallet',     label:'👜 Paytm Wallet' },
// ]

// export default function CheckoutPage() {
//   const navigate  = useNavigate()
//   const { items, clearCart } = useCartStore()
//   const { user }  = useAuthStore()

//   const cartTotal   = items.reduce((s,i) => s + i.price * i.qty, 0)
//   const deliveryFee = cartTotal >= 500 ? 0 : 40

//   const [form, setForm] = useState({
//     name: user?.name || '', phone: user?.phone || '',
//     street: '', city: 'Ahmedabad', state: 'Gujarat', pincode: '', instructions: '',
//   })
//   const [slot,       setSlot]       = useState('express')
//   const [payMethod,  setPayMethod]  = useState('upi')
//   const [cardInfo,   setCardInfo]   = useState({ number:'', expiry:'', cvv:'' })
//   const [coupon,     setCoupon]     = useState('')
//   const [discount,   setDiscount]   = useState(0)
//   const [couponMsg,  setCouponMsg]  = useState('')
//   const [placing,    setPlacing]    = useState(false)

//   const COUPONS = { FIRST50: 50, WKND20: Math.round(cartTotal * 0.2), SAVE100: 100 }
//   const totalPrice = cartTotal + deliveryFee - discount

//   const handleInput = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

//   const applyCoupon = () => {
//     const val = COUPONS[coupon.toUpperCase()]
//     if (val) {
//       setDiscount(val)
//       setCouponMsg(`✅ Coupon applied! You saved ₹${val}`)
//       toast.success(`Coupon applied – ₹${val} off!`)
//     } else {
//       setDiscount(0)
//       setCouponMsg('❌ Invalid coupon code')
//     }
//   }

//   const handlePlaceOrder = async () => {
//     if (!form.name || !form.phone || !form.street || !form.pincode) {
//       toast.error('Please fill in all delivery fields'); return
//     }
//     setPlacing(true)
//     try {
//       const orderData = {
//         items: items.map(i => ({ product: i._id, quantity: i.qty })),
//         shippingAddress: { name:form.name, phone:form.phone, street:form.street, city:form.city, state:form.state, pincode:form.pincode, instructions:form.instructions },
//         paymentMethod: payMethod,
//         deliverySlot: slot,
//         couponCode: coupon.toUpperCase(),
//       }
//       const data = await createOrder(orderData)
//       clearCart()
//       navigate(`/order-success/${data.order._id}`)
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to place order')
//     } finally { setPlacing(false) }
//   }

//   if (items.length === 0) return (
//     <div className="text-center py-24">
//       <div className="text-6xl mb-4">🛒</div>
//       <h2 className="font-bold text-xl mb-3">Your cart is empty</h2>
//       <Link to="/shop" className="btn-primary inline-flex px-7 py-3">Browse Shop</Link>
//     </div>
//   )

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//       {/* Breadcrumb */}
//       <nav className="flex items-center gap-2 text-sm text-gray-400 mb-7">
//         <Link to="/" className="hover:text-forest-600 font-medium">Home</Link> ›
//         <span className="text-gray-700 font-medium">Checkout</span>
//       </nav>

//       <div className="grid lg:grid-cols-[1fr_380px] gap-7">
//         {/* ── LEFT COLUMN ── */}
//         <div className="space-y-5">

//           {/* Delivery Address */}
//           <div className="bg-white rounded-2xl border border-gray-100 p-6">
//             <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
//               <FiMapPin className="text-forest-600"/> Delivery Address
//             </h2>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="col-span-2 sm:col-span-1">
//                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name *</label>
//                 <input name="name" value={form.name} onChange={handleInput} className="input-base" placeholder="Priya Sharma"/>
//               </div>
//               <div className="col-span-2 sm:col-span-1">
//                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
//                 <input name="phone" value={form.phone} onChange={handleInput} className="input-base" placeholder="+91 98765 43210"/>
//               </div>
//               <div className="col-span-2">
//                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Street Address *</label>
//                 <input name="street" value={form.street} onChange={handleInput} className="input-base" placeholder="Flat no., Building, Street, Area"/>
//               </div>
//               <div>
//                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">City</label>
//                 <input name="city" value={form.city} onChange={handleInput} className="input-base"/>
//               </div>
//               <div>
//                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Pincode *</label>
//                 <input name="pincode" value={form.pincode} onChange={handleInput} className="input-base" placeholder="380054"/>
//               </div>
//               <div className="col-span-2">
//                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Delivery Instructions</label>
//                 <input name="instructions" value={form.instructions} onChange={handleInput} className="input-base" placeholder="Leave at door, call on arrival…"/>
//               </div>
//             </div>
//           </div>

//           {/* Delivery Slot */}
//           <div className="bg-white rounded-2xl border border-gray-100 p-6">
//             <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
//               <FiClock className="text-forest-600"/> Delivery Time Slot
//             </h2>
//             <div className="grid grid-cols-2 gap-3">
//               {SLOTS.map(s => (
//                 <button key={s.id} onClick={() => setSlot(s.id)}
//                   className={`text-left p-4 rounded-xl border-2 transition-all ${slot === s.id ? 'border-forest-500 bg-forest-50' : 'border-gray-200 hover:border-forest-200'}`}>
//                   <div className="font-semibold text-sm text-gray-800">{s.label}</div>
//                   <div className={`text-xs font-bold mt-1 ${s.free ? 'text-green-600' : 'text-amber-500'}`}>{s.price}</div>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Payment Method */}
//           <div className="bg-white rounded-2xl border border-gray-100 p-6">
//             <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
//               <FiCreditCard className="text-forest-600"/> Payment Method
//             </h2>
//             <div className="space-y-2 mb-4">
//               {PAY_METHODS.map(m => (
//                 <button key={m.id} onClick={() => setPayMethod(m.id)}
//                   className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all ${payMethod === m.id ? 'border-forest-500 bg-forest-50 text-forest-700' : 'border-gray-200 hover:border-forest-200 text-gray-700'}`}>
//                   {m.label}
//                 </button>
//               ))}
//             </div>

//             {/* Card fields */}
//             {payMethod === 'card' && (
//               <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
//                 <div>
//                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Card Number</label>
//                   <input value={cardInfo.number} onChange={e => setCardInfo(c => ({...c, number:e.target.value}))} className="input-base" placeholder="1234 5678 9012 3456"/>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Expiry</label>
//                     <input value={cardInfo.expiry} onChange={e => setCardInfo(c => ({...c, expiry:e.target.value}))} className="input-base" placeholder="MM / YY"/>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">CVV</label>
//                     <input value={cardInfo.cvv} onChange={e => setCardInfo(c => ({...c, cvv:e.target.value}))} className="input-base" placeholder="•••" type="password"/>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── ORDER SUMMARY ── */}
//         <div>
//           <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
//             <h2 className="font-display text-xl font-bold mb-5 pb-4 border-b border-gray-100">Order Summary</h2>

//             {/* Items */}
//             <div className="space-y-3 mb-5 max-h-52 overflow-y-auto">
//               {items.map(item => (
//                 <div key={item._id} className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center text-xl shrink-0">{item.emoji}</div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
//                     <p className="text-xs text-gray-400">×{item.qty}</p>
//                   </div>
//                   <span className="text-sm font-bold text-gray-800 shrink-0">₹{item.price * item.qty}</span>
//                 </div>
//               ))}
//             </div>

//             {/* Coupon */}
//             <div className="flex gap-2 mb-4">
//               <div className="relative flex-1">
//                 <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
//                 <input value={coupon} onChange={e => setCoupon(e.target.value)} onKeyDown={e => e.key==='Enter' && applyCoupon()} className="input-base pl-9 text-sm py-2.5" placeholder="Coupon code"/>
//               </div>
//               <button onClick={applyCoupon} className="bg-forest-600 hover:bg-forest-500 text-white px-4 rounded-xl text-sm font-semibold transition-colors">Apply</button>
//             </div>
//             {couponMsg && <p className={`text-xs mb-3 font-medium ${discount > 0 ? 'text-green-600' : 'text-red-500'}`}>{couponMsg}</p>}

//             {/* Totals */}
//             <div className="border-t border-gray-100 pt-4 space-y-2.5">
//               <div className="flex justify-between text-sm text-gray-500">
//                 <span>Subtotal</span><span>₹{cartTotal}</span>
//               </div>
//               <div className="flex justify-between text-sm text-gray-500">
//                 <span>Delivery</span>
//                 <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
//               </div>
//               {discount > 0 && (
//                 <div className="flex justify-between text-sm text-green-600 font-semibold">
//                   <span>Discount</span><span>−₹{discount}</span>
//                 </div>
//               )}
//               <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
//                 <span>Total</span>
//                 <span className="font-display text-forest-700 text-xl">₹{totalPrice}</span>
//               </div>
//             </div>

//             <button onClick={handlePlaceOrder} disabled={placing} className="mt-5 w-full bg-forest-600 hover:bg-forest-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2">
//               {placing ? (
//                 <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Placing Order…</>
//               ) : (
//                 <>🎉 Place Order · ₹{totalPrice}</>
//               )}
//             </button>

//             <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
//               <FiLock size={11}/> Secured by SSL Encryption
//             </div>

//             {/* Available coupons hint */}
//             <div className="mt-4 bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
//               <div className="font-bold mb-1">Available Coupons:</div>
//               <div>• <strong>FIRST50</strong> – ₹50 off first order</div>
//               <div>• <strong>WKND20</strong> – 20% weekend offer</div>
//               <div>• <strong>SAVE100</strong> – ₹100 off on ₹800+</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
