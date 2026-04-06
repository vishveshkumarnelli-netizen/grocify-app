import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  FiGrid, FiShoppingBag, FiTag, FiPackage, FiUsers,
  FiSettings, FiLogOut, FiMenu, FiX, FiBell, FiSearch,
  FiChevronRight, FiBarChart2,
} from 'react-icons/fi'
import { useAdminStore } from '../../context/store'
import toast from 'react-hot-toast'

const NAV = [
  { section: 'Main', items: [
    { to: '/dashboard',  icon: FiGrid,         label: 'Dashboard' },
    { to: '/orders',     icon: FiPackage,      label: 'Orders',    badge: null },
    { to: '/products',   icon: FiShoppingBag,  label: 'Products' },
    { to: '/customers',  icon: FiUsers,        label: 'Customers' },
  ]},
  { section: 'Store', items: [
    { to: '/categories', icon: FiTag,          label: 'Categories' },
    { to: '/settings',   icon: FiSettings,     label: 'Settings' },
  ]},
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { admin, logout } = useAdminStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── SIDEBAR ── */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} shrink-0 bg-forest-700 flex flex-col transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-white/10">
          <div className="w-9 h-9 bg-gradient-to-br from-lime-300 to-forest-400 rounded-xl flex items-center justify-center text-xl shrink-0">🥦</div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="font-display font-black text-white text-lg leading-none">Grocify</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-5">
          {NAV.map(section => (
            <div key={section.section}>
              {sidebarOpen && (
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2">{section.section}</p>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <NavLink key={item.to} to={item.to}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'} ${!sidebarOpen ? 'justify-center px-2' : ''}`
                    }
                  >
                    <item.icon size={18} className="shrink-0"/>
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                    {sidebarOpen && item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-2 py-3 border-t border-white/10">
          <div className={`flex items-center gap-3 px-2 py-2 ${!sidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-lime-300 to-forest-400 rounded-full flex items-center justify-center text-xs font-bold text-forest-700 shrink-0">
              {admin?.name?.[0]?.toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{admin?.name}</p>
                <p className="text-[10px] text-white/40 truncate">{admin?.email}</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout}
            className={`sidebar-link sidebar-link-inactive w-full mt-1 hover:bg-red-500/20 hover:text-red-300 ${!sidebarOpen ? 'justify-center px-2' : ''}`}>
            <FiLogOut size={16} className="shrink-0"/>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(v => !v)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            {sidebarOpen ? <FiX size={18}/> : <FiMenu size={18}/>}
          </button>

          <div className="flex items-center gap-2 flex-1 max-w-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <FiSearch size={14} className="text-gray-400"/>
            <input placeholder="Search products, orders…" className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"/>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100">
              <FiBell size={18}/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 bg-gradient-to-br from-forest-300 to-forest-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {admin?.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800">{admin?.name}</p>
                <p className="text-[10px] text-gray-400">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
