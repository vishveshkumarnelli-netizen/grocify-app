import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiFilter, FiChevronDown, FiEye, FiRefreshCw, FiDownload } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getAllOrders, updateOrderStatus } from '../services/api'

const STATUSES = [
  { value:'',               label:'All Orders' },
  { value:'pending',        label:'Pending' },
  { value:'confirmed',      label:'Confirmed' },
  { value:'packing',        label:'Packing' },
  { value:'out_for_delivery', label:'Out for Delivery' },
  { value:'delivered',      label:'Delivered' },
  { value:'cancelled',      label:'Cancelled' },
]

const STATUS_CONFIG = {
  pending:          { label:'Pending',          cls:'badge-gray' },
  confirmed:        { label:'Confirmed',        cls:'badge-blue' },
  packing:          { label:'Packing',          cls:'badge-amber' },
  out_for_delivery: { label:'Out for Delivery', cls:'badge-purple' },
  delivered:        { label:'Delivered',        cls:'badge-green' },
  cancelled:        { label:'Cancelled',        cls:'badge-red' },
}

const NEXT_STATUS = {
  pending:          'confirmed',
  confirmed:        'packing',
  packing:          'out_for_delivery',
  out_for_delivery: 'delivered',
}

export default function OrdersPage() {
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [filters,   setFilters]   = useState({ search:'', status:'', page:1 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllOrders(filters)
      setOrders(data.orders || [])
    } catch { toast.error('Failed to load orders') }
    finally  { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      toast.success(`Order moved to "${STATUS_CONFIG[newStatus]?.label}"`)
      load()
    } catch { toast.error('Update failed') }
    finally  { setUpdatingId(null) }
  }

  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }))

  const filtered = orders.filter(o => {
    const q = filters.search.toLowerCase()
    const matchSearch = !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q)
    const matchStatus = !filters.status || o.status === filters.status
    return matchSearch && matchStatus
  })

  const totalRevenue = filtered.filter(o => o.isPaid).reduce((s,o) => s + o.totalPrice, 0)

  return (
    <div className="p-7 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} orders · ₹{totalRevenue.toLocaleString()} revenue</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost btn-sm"><FiRefreshCw size={13}/></button>
          <button className="btn-ghost btn-sm"><FiDownload size={13}/> Export</button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUSES.map(s => {
          const count = s.value ? orders.filter(o => o.status === s.value).length : orders.length
          return (
            <button key={s.value} onClick={() => setF('status', s.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filters.status === s.value
                  ? 'bg-forest-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {s.label}
              <span className={`${filters.status === s.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'} text-[10px] font-bold px-1.5 py-0.5 rounded-full`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
        <input value={filters.search} onChange={e => setF('search', e.target.value)}
          className="input pl-9 py-2 text-sm" placeholder="Search by order ID, customer…"/>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Order #','Customer','Items','Total','Payment','Status','Date','Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:8}).map((_,i) => (
                  <tr key={i}><td colSpan={8} className="table-td">
                    <div className="h-5 bg-gray-100 rounded animate-pulse"/>
                  </td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="table-td text-center py-16 text-gray-400">
                  <div className="text-4xl mb-2">📦</div>
                  <p>No orders found</p>
                </td></tr>
              ) : filtered.map(order => {
                const cfg = STATUS_CONFIG[order.status]
                const nextStatus = NEXT_STATUS[order.status]
                const isUpdating = updatingId === order._id

                return (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                    {/* Order # */}
                    <td className="table-td">
                      <Link to={`/orders/${order._id}`} className="font-bold text-forest-600 hover:underline text-sm">
                        #{order.orderNumber}
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-forest-100 rounded-full flex items-center justify-center text-xs font-bold text-forest-700 shrink-0">
                          {order.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-xs text-gray-800">{order.user?.name}</p>
                          <p className="text-[10px] text-gray-400">{order.user?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="table-td">
                      <div className="flex -space-x-1">
                        {order.items?.slice(0,3).map((item,i) => (
                          <div key={i} className="w-7 h-7 bg-forest-50 border border-white rounded-lg flex items-center justify-center text-base">
                            {item.emoji}
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="w-7 h-7 bg-gray-100 border border-white rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-500">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="table-td">
                      <span className="font-display font-bold text-forest-700">₹{order.totalPrice}</span>
                    </td>

                    {/* Payment */}
                    <td className="table-td">
                      <span className={`badge text-[10px] ${order.isPaid ? 'badge-green' : 'badge-amber'}`}>
                        {order.isPaid ? '✔ Paid' : '⏳ Pending'}
                      </span>
                    </td>

                    {/* Status with inline update */}
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <span className={`badge text-[10px] ${cfg?.cls || 'badge-gray'}`}>{cfg?.label}</span>
                        {nextStatus && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, nextStatus)}
                            disabled={isUpdating}
                            title={`Move to ${STATUS_CONFIG[nextStatus]?.label}`}
                            className="text-[10px] text-forest-600 hover:text-forest-800 font-bold underline underline-offset-2 disabled:opacity-50"
                          >
                            {isUpdating ? '…' : '→'}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="table-td text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}
                    </td>

                    {/* Actions */}
                    <td className="table-td">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/orders/${order._id}`} className="p-1.5 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors">
                          <FiEye size={14}/>
                        </Link>
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                            disabled={isUpdating}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel order"
                          >
                            <FiFilter size={14}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
