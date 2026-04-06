import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiPackage, FiMapPin, FiCreditCard, FiCheckCircle } from 'react-icons/fi'
import { getOrder } from '../services/api'

const TRACK_STEPS = [
  { status:'confirmed',        icon:'✅', label:'Confirmed' },
  { status:'packing',          icon:'🧺', label:'Packing' },
  { status:'out_for_delivery', icon:'🚚', label:'On the Way' },
  { status:'delivered',        icon:'🏠', label:'Delivered' },
]

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    getOrder(id).then(d => setOrder(d.order)).catch(() => {})
  }, [id])

  const currentStep = order
    ? TRACK_STEPS.findIndex(s => s.status === order.status)
    : 0

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      {/* Success icon */}
      <div className="w-24 h-24 bg-green-50 border-4 border-green-400 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 animate-pop">
        ✅
      </div>

      <h1 className="font-display text-4xl font-black text-forest-700 mb-3">Order Placed!</h1>
      <p className="text-gray-500 text-base leading-relaxed mb-2">
        🎉 Thank you for shopping with Grocify! Your fresh groceries are being packed.
      </p>
      {order && (
        <p className="text-sm text-gray-400 mb-8">
          Order <strong className="text-forest-600">#{order.orderNumber}</strong> · Estimated delivery in{' '}
          <strong>{order.deliverySlot === 'express' ? '60 minutes' : '2–3 hours'}</strong>
        </p>
      )}

      {/* Tracking steps */}
      <div className="bg-forest-50 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between relative">
          {/* Track line */}
          <div className="absolute left-0 right-0 top-6 h-0.5 bg-forest-200 z-0"/>
          <div className="absolute left-0 top-6 h-0.5 bg-forest-500 z-0 transition-all" style={{ width: `${(currentStep / (TRACK_STEPS.length - 1)) * 100}%` }}/>
          {TRACK_STEPS.map((step, i) => (
            <div key={step.status} className="flex flex-col items-center gap-2 z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all ${
                i <= currentStep ? 'bg-forest-500 border-forest-500' : 'bg-white border-forest-200'
              }`}>
                {step.icon}
              </div>
              <span className={`text-xs font-semibold ${i <= currentStep ? 'text-forest-700' : 'text-gray-400'}`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order details */}
      {order && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-left mb-8 space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-3">Order Details</h3>

          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-xl">{item.emoji}</span>
                <span className="flex-1 text-gray-700">{item.name} ×{item.quantity}</span>
                <span className="font-semibold">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-1.5 text-sm text-gray-500">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{order.itemsPrice}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span className={order.deliveryPrice === 0 ? 'text-green-600 font-semibold' : ''}>{order.deliveryPrice === 0 ? 'FREE' : `₹${order.deliveryPrice}`}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-green-600 font-semibold"><span>Discount</span><span>−₹{order.discountAmount}</span></div>}
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
              <span>Total</span><span className="text-forest-700">₹{order.totalPrice}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t text-sm">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5"><FiMapPin size={11}/> Delivery To</div>
              <div className="text-gray-700 leading-relaxed">
                <div className="font-semibold">{order.shippingAddress?.name}</div>
                <div>{order.shippingAddress?.street}</div>
                <div>{order.shippingAddress?.city}, {order.shippingAddress?.pincode}</div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5"><FiCreditCard size={11}/> Payment</div>
              <div className="text-gray-700 capitalize">{order.paymentMethod?.replace('_',' ')}</div>
              <div className={`text-xs mt-0.5 font-semibold ${order.isPaid ? 'text-green-600' : 'text-amber-500'}`}>
                {order.isPaid ? '✔ Paid' : '⏳ Pending'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center flex-wrap">
        <Link to="/shop" className="btn-primary px-8 py-3 rounded-xl">🛒 Continue Shopping</Link>
        <Link to="/orders" className="btn-outline px-8 py-3 rounded-xl">📦 View All Orders</Link>
      </div>
    </div>
  )
}
