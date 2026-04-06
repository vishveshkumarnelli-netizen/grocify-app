import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiMapPin, FiCreditCard, FiPackage, FiUser, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getOrderById, updateOrderStatus } from '../services/api'

const STATUS_FLOW = ['pending','confirmed','packing','out_for_delivery','delivered']
const STATUS_CONFIG = {
  pending:          { label:'Pending',          icon:'⏳', cls:'badge-gray' },
  confirmed:        { label:'Confirmed',        icon:'✅', cls:'badge-blue' },
  packing:          { label:'Packing',          icon:'🧺', cls:'badge-amber' },
  out_for_delivery: { label:'Out for Delivery', icon:'🚚', cls:'badge-purple' },
  delivered:        { label:'Delivered',        icon:'🏠', cls:'badge-green' },
  cancelled:        { label:'Cancelled',        icon:'❌', cls:'badge-red' },
}

const PAY_METHOD_LABELS = {
  upi:'UPI / GPay', card:'Credit/Debit Card', netbanking:'Net Banking', cod:'Cash on Delivery', wallet:'Paytm Wallet',
}

export default function OrderDetail() {
  const { id } = useParams()
  const [order,    setOrder]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getOrderById(id)
      setOrder(data.order)
    } catch { toast.error('Order not found') }
    finally  { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      await updateOrderStatus(id, newStatus)
      toast.success(`Status → ${STATUS_CONFIG[newStatus]?.label}`)
      load()
    } catch { toast.error('Update failed') }
    finally  { setUpdating(false) }
  }

  if (loading) return (
    <div className="p-8 space-y-5">
      <div className="h-8 w-40 bg-gray-100 rounded-xl animate-pulse"/>
      <div className="grid grid-cols-3 gap-5">
        {[1,2,3].map(i => <div key={i} className="card h-48 animate-pulse"/>)}
      </div>
    </div>
  )

  if (!order) return (
    <div className="p-8 text-center">
      <p className="text-gray-400">Order not found</p>
      <Link to="/orders" className="btn-green mt-4 inline-flex">Back</Link>
    </div>
  )

  const currentStep = STATUS_FLOW.indexOf(order.status)
  const cfg = STATUS_CONFIG[order.status]

  return (
    <div className="p-7 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/orders" className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500"><FiArrowLeft size={18}/></Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-black text-gray-900">
            Order <span className="text-forest-600">#{order.orderNumber}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Placed {new Date(order.createdAt).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </p>
        </div>
        <span className={`badge text-xs px-3 py-1.5 ${cfg?.cls}`}>
          {cfg?.icon} {cfg?.label}
        </span>
      </div>

      {/* Status update */}
      {order.status !== 'cancelled' && order.status !== 'delivered' && (
        <div className="card p-5">
          <p className="text-sm font-bold text-gray-700 mb-3">Update Order Status</p>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FLOW.map((s, i) => {
              const isCurrent = s === order.status
              const isPast    = i < currentStep
              const isFuture  = i > currentStep
              return (
                <button key={s}
                  onClick={() => !isCurrent && !isPast && handleStatusChange(s)}
                  disabled={updating || isCurrent || isPast}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border-2 ${
                    isCurrent ? 'bg-forest-600 text-white border-forest-600 shadow-sm' :
                    isPast    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' :
                    'bg-white text-gray-600 border-gray-200 hover:border-forest-400 hover:bg-forest-50 cursor-pointer'
                  }`}
                >
                  {STATUS_CONFIG[s]?.icon} {STATUS_CONFIG[s]?.label}
                </button>
              )
            })}
            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={updating}
              className="px-4 py-2 rounded-xl text-xs font-semibold border-2 border-red-200 text-red-500 hover:bg-red-50 ml-auto transition-colors"
            >
              ❌ Cancel Order
            </button>
          </div>
        </div>
      )}

      {/* Tracking timeline */}
      {order.status !== 'cancelled' && (
        <div className="card p-6">
          <p className="text-sm font-bold text-gray-700 mb-5">Order Tracking</p>
          <div className="relative flex justify-between">
            <div className="absolute left-6 right-6 top-5 h-0.5 bg-gray-100 z-0"/>
            <div className="absolute left-6 top-5 h-0.5 bg-forest-500 z-0 transition-all duration-700"
              style={{ width: currentStep >= 0 ? `${(currentStep/(STATUS_FLOW.length-1))*100}%` : '0%' }}/>
            {STATUS_FLOW.map((s, i) => {
              const done = i <= currentStep
              const c = STATUS_CONFIG[s]
              return (
                <div key={s} className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all ${done ? 'bg-forest-500 border-forest-500' : 'bg-white border-gray-200'}`}>
                    {c?.icon}
                  </div>
                  <span className={`text-[10px] font-bold text-center leading-tight ${done ? 'text-forest-700' : 'text-gray-400'}`}>{c?.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 3-column info grid */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Customer */}
        <div className="card p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FiUser size={11}/> Customer</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center font-bold text-forest-700">
              {order.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">{order.user?.name}</p>
              <p className="text-xs text-gray-400">{order.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="card p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FiMapPin size={11}/> Delivery Address</p>
          <div className="text-sm text-gray-700 space-y-0.5 leading-relaxed">
            <p className="font-semibold">{order.shippingAddress?.name}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}</p>
            {order.shippingAddress?.phone && <p className="text-xs text-gray-400 pt-1">📞 {order.shippingAddress.phone}</p>}
            {order.shippingAddress?.instructions && <p className="text-xs text-gray-400 italic mt-1">"{order.shippingAddress.instructions}"</p>}
          </div>
        </div>

        {/* Payment */}
        <div className="card p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FiCreditCard size={11}/> Payment</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium">{PAY_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span>
              <span className={`font-bold ${order.isPaid ? 'text-green-600' : 'text-amber-500'}`}>{order.isPaid ? '✔ Paid' : '⏳ Unpaid'}</span>
            </div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery Slot</span><span className="font-medium capitalize">{order.deliverySlot}</span></div>
            {order.couponCode && <div className="flex justify-between"><span className="text-gray-500">Coupon</span><span className="font-bold text-forest-600">{order.couponCode}</span></div>}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card">
        <div className="card-header">
          <span className="card-title flex items-center gap-2"><FiPackage size={15}/> Order Items</span>
          <span className="text-xs text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Product','Unit','Price','Qty','Total'].map(h => <th key={h} className="table-th">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-forest-50 rounded-xl flex items-center justify-center text-2xl border border-forest-100">{item.emoji}</div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                  </td>
                  <td className="table-td text-xs text-gray-500">{item.unit}</td>
                  <td className="table-td text-sm">₹{item.price}</td>
                  <td className="table-td">
                    <span className="inline-block bg-forest-50 text-forest-700 text-xs font-bold px-2.5 py-0.5 rounded-full">×{item.quantity}</span>
                  </td>
                  <td className="table-td font-display font-bold text-forest-700">₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Totals footer */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2 bg-gray-50/50">
          {[
            ['Subtotal', `₹${order.itemsPrice}`],
            ['Delivery', order.deliveryPrice === 0 ? 'FREE' : `₹${order.deliveryPrice}`],
            ...(order.discountAmount > 0 ? [['Discount', `-₹${order.discountAmount}`]] : []),
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-sm text-gray-500">
              <span>{label}</span>
              <span className={label==='Delivery'&&val==='FREE' ? 'text-green-600 font-semibold' : label==='Discount' ? 'text-green-600 font-semibold' : ''}>{val}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="font-display text-forest-700 text-lg">₹{order.totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
