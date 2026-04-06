import { useEffect, useState } from 'react'
import { FiSearch, FiUsers, FiShoppingBag, FiDollarSign, FiRefreshCw } from 'react-icons/fi'
import { getAllUsers, getAllOrders } from '../services/api'

export default function CustomersPage() {
  const [users,   setUsers]   = useState([])
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    Promise.all([getAllUsers(), getAllOrders()])
      .then(([u, o]) => {
        setUsers(u.users  || [])
        setOrders(o.orders || [])
      })
      .finally(() => setLoading(false))
  }, [])

  // Build per-user stats from orders
  const userStats = users.reduce((map, u) => {
    const userOrders = orders.filter(o => o.user?._id === u._id || o.user === u._id)
    const spent      = userOrders.filter(o => o.isPaid).reduce((s,o) => s + o.totalPrice, 0)
    map[u._id] = { orderCount: userOrders.length, spent, lastOrder: userOrders[0]?.createdAt }
    return map
  }, {})

  const AVATAR_COLORS = [
    ['#d8f3dc','#1b4332'],['#e0f4ff','#1a5276'],['#fff3e0','#b7600d'],
    ['#f0ebfa','#7c5cbf'],['#fde8e8','#c0392b'],['#fef9c3','#7d6608'],
  ]

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = orders.filter(o => o.isPaid).reduce((s,o) => s + o.totalPrice, 0)
  const vipUsers     = users.filter(u => (userStats[u._id]?.spent || 0) >= 2000)

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900">Customers</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} registered customers</p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon:FiUsers,       label:'Total Customers', value:users.length,              color:'bg-blue-50 text-blue-600' },
          { icon:FiDollarSign,  label:'Total Revenue',   value:`₹${(totalRevenue/1000).toFixed(1)}K`, color:'bg-green-50 text-green-600' },
          { icon:FiShoppingBag, label:'VIP Customers',   value:vipUsers.length,           color:'bg-purple-50 text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}><s.icon size={18}/></div>
            <div>
              <p className="font-display font-black text-xl text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input pl-9 py-2 text-sm" placeholder="Search by name or email…"/>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Customer','Email','Phone','Orders','Total Spent','Joined','Status'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:8}).map((_,i) => (
                  <tr key={i}><td colSpan={7} className="table-td"><div className="h-5 bg-gray-100 rounded animate-pulse"/></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="table-td text-center py-16 text-gray-400">
                  <div className="text-4xl mb-2">👥</div>
                  <p>No customers found</p>
                </td></tr>
              ) : filtered.map((user, i) => {
                const [bg, tc] = AVATAR_COLORS[i % AVATAR_COLORS.length]
                const stats    = userStats[user._id] || {}
                const isVip    = (stats.spent || 0) >= 2000
                const isNew    = stats.orderCount === 0

                return (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background:bg, color:tc }}>
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                          {isVip && <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">⭐ VIP</span>}
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-xs text-gray-500">{user.email}</td>
                    <td className="table-td text-xs text-gray-500">{user.phone || '—'}</td>
                    <td className="table-td">
                      <span className="font-bold text-gray-800">{stats.orderCount || 0}</span>
                    </td>
                    <td className="table-td">
                      <span className="font-display font-bold text-forest-700">₹{stats.spent || 0}</span>
                    </td>
                    <td className="table-td text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td className="table-td">
                      <span className={`badge text-[10px] ${isNew ? 'badge-amber' : isVip ? 'badge-purple' : 'badge-green'}`}>
                        {isNew ? 'New' : isVip ? 'VIP' : 'Active'}
                      </span>
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
