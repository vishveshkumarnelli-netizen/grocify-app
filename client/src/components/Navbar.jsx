import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiSearch, FiUser, FiMenu, FiX, FiLogOut, FiPackage } from 'react-icons/fi'
import { useCartStore, useAuthStore, useUIStore } from '../context/store'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  const cartCount = useCartStore(s => s.items.reduce((t, i) => t + i.qty, 0))
  const { user, logout } = useAuthStore()
  const { openCart, openSearch, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = () => { logout(); navigate('/'); closeMobileMenu() }

  const navLinks = [
    { to: '/',     label: 'Home' },
    { to: '/shop', label: 'Shop' },
  ]

  return (
    <>
      {/* Top strip */}
      <div className="bg-forest-600 text-white text-center text-xs py-2 px-4 font-medium tracking-wide">
        🚀 Free delivery above <span className="text-lime-300 font-bold">₹500</span> · Use code{' '}
        <span className="text-lime-300 font-bold">FIRST50</span> for ₹50 off your first order!
      </div>

      {/* Main navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
      } border-b border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-forest-400 to-forest-700 rounded-xl flex items-center justify-center text-xl shadow-sm">
              🥦
            </div>
            <span className="font-display text-2xl font-black text-forest-700">Grocify</span>
          </Link>

          {/* Search bar – desktop */}
          <button
            onClick={openSearch}
            className="hidden md:flex flex-1 max-w-md mx-auto items-center gap-3 bg-forest-50 border border-forest-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 hover:border-forest-400 transition-colors cursor-text"
          >
            <FiSearch className="text-forest-400 shrink-0" />
            <span>Search for vegetables, fruits, dairy…</span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-forest-700 bg-forest-50 font-semibold' : 'text-gray-600 hover:text-forest-700 hover:bg-forest-50'
                }`
              }>{l.label}</NavLink>
            ))}

            {user ? (
              <div className="relative group ml-2">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest-700 hover:bg-forest-50">
                  <div className="w-7 h-7 bg-forest-100 rounded-full flex items-center justify-center text-xs font-bold text-forest-700">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  {user.name.split(' ')[0]}
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-hover border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-1 z-50">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-forest-50"><FiUser size={14}/> Profile</Link>
                  <Link to="/orders"  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-forest-50"><FiPackage size={14}/> My Orders</Link>
                  <hr className="my-1"/>
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"><FiLogOut size={14}/> Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest-700 hover:bg-forest-50">
                <FiUser size={15}/> Sign In
              </Link>
            )}

            <button onClick={openSearch} className="p-2.5 rounded-lg text-gray-500 hover:text-forest-700 hover:bg-forest-50 md:hidden">
              <FiSearch size={18}/>
            </button>

            <button
              onClick={openCart}
              className="relative ml-1 flex items-center gap-2 bg-forest-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-500 transition-colors"
            >
              <FiShoppingCart size={16}/>
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile: search + cart + hamburger */}
          <div className="flex items-center gap-2 ml-auto md:hidden">
            <button onClick={openSearch} className="p-2 rounded-lg text-gray-500 hover:bg-forest-50"><FiSearch size={20}/></button>
            <button onClick={openCart} className="relative p-2 rounded-lg text-gray-500 hover:bg-forest-50">
              <FiShoppingCart size={20}/>
              {cartCount > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
            <button onClick={toggleMobileMenu} className="p-2 rounded-lg text-gray-500 hover:bg-forest-50">
              {mobileMenuOpen ? <FiX size={20}/> : <FiMenu size={20}/>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-fade-in">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to==='/'} onClick={closeMobileMenu}
                className={({isActive}) => `block px-4 py-2.5 rounded-xl text-sm font-medium ${isActive?'bg-forest-50 text-forest-700':'text-gray-600'}`}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link to="/profile" onClick={closeMobileMenu} className="block px-4 py-2.5 rounded-xl text-sm text-gray-600">👤 Profile</Link>
                <Link to="/orders"  onClick={closeMobileMenu} className="block px-4 py-2.5 rounded-xl text-sm text-gray-600">📦 My Orders</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-500">🚪 Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={closeMobileMenu} className="block px-4 py-2.5 rounded-xl text-sm text-gray-600">🔑 Sign In</Link>
            )}
          </div>
        )}
      </nav>
    </>
  )
}
