import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import {
  FiShoppingBag, FiPackage, FiUsers, FiDollarSign,
  FiTrendingUp, FiAlertTriangle, FiArrowRight, FiRefreshCw
} from 'react-icons/fi'
import { getAdminStats } from '../services/api'

const STATUS_CONFIG = {
  pending:          { label:'Pending',          color:'bg-gray-100 text-gray-600' },
  confirmed:        { label:'Confirmed',        color:'bg-blue-50 text-blue-700' },
  packing:          { label:'Packing',          color:'bg-amber-50 text-amber-700' },
  out_for_delivery: { label:'Out for Delivery', color:'bg-purple-50 text-purple-700' },
  delivered:        { label:'Delivered',        color:'bg-green-50 text-green-700' },
  cancelled:        { label:'Cancelled',        color:'bg-red-50 text-red-600' },
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card p-5 hover:shadow-panel transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center`}>
          <Icon size={20}/>
        </div>
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{sub}</span>
      </div>
      <div className="font-display text-3xl font-black text-gray-900 mb-0.5">{value}</div>
      <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-panel p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name === 'revenue' ? `₹${p.value.toLocaleString()}` : `${p.value} orders`}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAdminStats()
      setStats(data.stats)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-4 gap-5 mb-8">
        {Array.from({length:4}).map((_,i) => <div key={i} className="card h-32 animate-pulse"/>)}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card h-80 animate-pulse"/>
        <div className="card h-80 animate-pulse"/>
      </div>
    </div>
  )

  const { totalRevenue=0, totalOrders=0, totalProducts=0, totalUsers=0,
    statusMap={}, monthlyData=[], recentOrders=[], topProducts=[], lowStockProducts=[] } = stats || {}

  return (
    <div className="p-7 space-y-7">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <button onClick={load} className="btn-ghost btn-sm gap-2">
          <FiRefreshCw size={13}/> Refresh
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiDollarSign}  label="Total Revenue"  value={`₹${(totalRevenue/1000).toFixed(1)}K`} sub="+12.5%" color="bg-green-50 text-green-600"/>
        <StatCard icon={FiPackage}     label="Total Orders"   value={totalOrders.toLocaleString()}           sub="+8.2%"  color="bg-blue-50 text-blue-600"/>
        <StatCard icon={FiShoppingBag} label="Products"       value={totalProducts}                         sub="Active" color="bg-amber-50 text-amber-600"/>
        <StatCard icon={FiUsers}       label="Customers"      value={totalUsers.toLocaleString()}            sub="+3.1%"  color="bg-purple-50 text-purple-600"/>
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid xl:grid-cols-3 gap-5">
        {/* Revenue area chart */}
        <div className="card xl:col-span-2">
          <div className="card-header">
            <span className="card-title">📈 Monthly Revenue</span>
            <span className="text-xs text-gray-400">{new Date().getFullYear()}</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="label" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#1b4332" strokeWidth={2.5} fill="url(#rev)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order status doughnut-style mini chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📦 Order Status</span>
          </div>
          <div className="p-5 space-y-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = statusMap[key] || 0
              const pct   = totalOrders ? Math.round((count / totalOrders) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-600">{cfg.label}</span>
                    <span className="text-gray-800 font-bold">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-forest-500 rounded-full transition-all" style={{ width: `${pct}%` }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid xl:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <div className="card xl:col-span-2">
          <div className="card-header">
            <span className="card-title">🛒 Recent Orders</span>
            <Link to="/orders" className="text-xs font-semibold text-forest-600 hover:text-forest-800 flex items-center gap-1">
              View All <FiArrowRight size={12}/>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Order','Customer','Items','Total','Status','Date'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={6} className="table-td text-center text-gray-400 py-8">No orders yet</td></tr>
                ) : recentOrders.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="table-td">
                      <Link to={`/orders/${o._id}`} className="font-bold text-forest-600 hover:underline">
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="table-td">
                      <div className="font-medium">{o.user?.name}</div>
                      <div className="text-xs text-gray-400">{o.user?.email}</div>
                    </td>
                    <td className="table-td text-gray-500">{o.items?.length} items</td>
                    <td className="table-td font-display font-bold text-forest-700">₹{o.totalPrice}</td>
                    <td className="table-td">
                      <span className={`badge text-[11px] px-2.5 py-1 ${STATUS_CONFIG[o.status]?.color || 'badge-gray'}`}>
                        {STATUS_CONFIG[o.status]?.label || o.status}
                      </span>
                    </td>
                    <td className="table-td text-gray-400 text-xs">
                      {new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products + Low Stock */}
        <div className="space-y-5">
          {/* Top Products */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🏆 Top Products</span>
              <Link to="/products" className="text-xs font-semibold text-forest-600 hover:text-forest-800 flex items-center gap-1">All <FiArrowRight size={11}/></Link>
            </div>
            <div className="divide-y divide-gray-50">
              {topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-bold text-gray-300 w-4">#{i+1}</span>
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.sold} sold</p>
                  </div>
                  <span className="font-display font-bold text-forest-700 text-sm">₹{p.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <div className="card border-amber-200 bg-amber-50">
              <div className="card-header border-amber-100">
                <span className="card-title flex items-center gap-2 text-amber-700">
                  <FiAlertTriangle size={15}/> Low Stock Alert
                </span>
                <span className="badge-amber">{lowStockProducts.length}</span>
              </div>
              <div className="divide-y divide-amber-100">
                {lowStockProducts.map(p => (
                  <div key={p._id} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.stock === 0 ? 'Out' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
