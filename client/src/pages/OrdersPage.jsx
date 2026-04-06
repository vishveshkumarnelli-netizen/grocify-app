import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiArrowRight, FiClock } from 'react-icons/fi'
import { getMyOrders } from '../services/api'

const statusLabels = {
  pending:          'Pending',
  confirmed:        'Confirmed',
  packing:          'Packing',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
}

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrders()
      .then(d  => setOrders(d.orders || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
      {Array.from({length:3}).map((_,i) => (
        <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"/>
      ))}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display text-3xl font-black text-gray-900">My Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/shop" className="btn-primary text-sm px-5 py-2.5 rounded-xl">Shop Again</Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="font-bold text-lg text-gray-700 mb-2">No orders yet</h3>
          <p className="text-sm text-gray-400 mb-6">Start shopping to see your orders here</p>
          <Link to="/shop" className="btn-primary px-7 py-3 inline-flex">Browse Shop</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all p-5">
              {/* Top row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FiPackage size={14} className="text-forest-500"/>
                    <span className="font-bold text-gray-800 text-sm">#{order.orderNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FiClock size={11}/>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border status-${order.status}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                  <FiArrowRight size={16} className="text-gray-400"/>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {order.items?.slice(0,4).map((item,i) => (
                  <div key={i} className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center text-xl border border-forest-100">
                    {item.emoji}
                  </div>
                ))}
                {order.items?.length > 4 && (
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                    +{order.items.length - 4}
                  </div>
                )}
                <span className="text-xs text-gray-400 ml-1">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="text-xs text-gray-400 capitalize">
                  {order.paymentMethod?.replace('_',' ')} ·{' '}
                  <span className={order.isPaid ? 'text-green-600 font-semibold' : 'text-amber-500 font-semibold'}>
                    {order.isPaid ? '✔ Paid' : '⏳ Pending'}
                  </span>
                </div>
                <span className="font-display font-bold text-forest-700 text-lg">₹{order.totalPrice}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
