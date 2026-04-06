import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiShoppingCart, FiStar, FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
import { fetchProducts, fetchCategories } from '../services/api'

// ── Timer ────────────────────────────────────────────────────────────────────
function Countdown({ initial }) {
  const [time, setTime] = useState(initial)
  useEffect(() => {
    const t = setInterval(() => {
      setTime(p => {
        let { h, m, s } = p
        s--; if (s < 0) { s = 59; m-- } if (m < 0) { m = 59; h-- } if (h < 0) { h = 23; m = 59; s = 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  const pad = n => String(n).padStart(2, '0')
  return (
    <div className="flex gap-2">
      {[['h','HRS'],['m','MIN'],['s','SEC']].map(([k,l]) => (
        <div key={k} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-center min-w-[52px]">
          <div className="font-display text-2xl font-bold text-white">{pad(time[k])}</div>
          <div className="text-[9px] text-white/50 tracking-widest">{l}</div>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [featured,   setFeatured]   = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories().then(d => setCategories(d.categories || []))
    fetchProducts({ featured: true, limit: 8 }).then(d  => setFeatured(d.products || []))
    fetchProducts({ badge: 'new', limit: 4 }).then(d => setNewArrivals(d.products || []))
  }, [])

  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-forest-700 via-forest-600 to-forest-800 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 right-1/4 w-96 h-96 bg-white/5 rounded-full"/>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-lime-300/10 rounded-full"/>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 tracking-wide">
              🌿 100% Organic & Farm Fresh
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-black text-white leading-[1.08] mb-5">
              Fresh Groceries<br/>
              <em className="text-lime-300 not-italic">Delivered Fast</em><br/>
              to Your Door
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-md">
              Order fresh fruits, vegetables, dairy and more from local farms. Delivered within 60 minutes, right to your doorstep.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => navigate('/shop')} className="btn-lime text-base px-7 py-3.5 rounded-xl">
                🛒 Shop Now
              </button>
              <button className="btn-outline border-white/30 text-white hover:bg-white hover:text-forest-700 text-base px-7 py-3.5 rounded-xl">
                📱 Download App
              </button>
            </div>
            <div className="flex gap-8 mt-9">
              {[['50K+','Happy Customers'],['500+','Fresh Products'],['60 min','Delivery Time']].map(([n,l]) => (
                <div key={l}>
                  <div className="font-display text-2xl font-bold text-white">{n}</div>
                  <div className="text-xs text-white/50 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center relative">
            <div className="text-[160px] animate-float filter drop-shadow-2xl">🥬</div>
            <div className="absolute top-1/4 left-0 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-fade-in">
              <span className="text-2xl">⭐</span>
              <div><div className="text-sm font-bold">4.9 Rating</div><div className="text-xs text-gray-400">50K+ Reviews</div></div>
            </div>
            <div className="absolute bottom-1/4 right-0 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-fade-in">
              <span className="text-2xl">🚀</span>
              <div><div className="text-sm font-bold">Express Delivery</div><div className="text-xs text-gray-400">Within 60 mins</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DELIVERY BAR ── */}
      <div className="bg-forest-50 border-y border-forest-200 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-x-10 gap-y-3">
          {[
            [FiTruck,'Free Delivery','Above ₹500'],
            ['⏱','Express Delivery','In 60 Minutes'],
            ['🌿','100% Organic','Farm Fresh'],
            [FiRefreshCw,'Easy Returns','Within 24 Hrs'],
            [FiShield,'Secure Payments','UPI / Cards / COD'],
          ].map(([Icon,t1,t2],i) => (
            <div key={i} className="flex items-center gap-2.5 text-forest-700">
              <span className="text-lg">{typeof Icon === 'string' ? Icon : <Icon size={18}/>}</span>
              <div>
                <div className="text-sm font-bold">{t1}</div>
                <div className="text-xs text-forest-500">{t2}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Shop by <span className="text-forest-600">Category</span></h2>
            <p className="text-gray-400 mt-1.5 text-sm">Fresh produce organized for you</p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-forest-600 border-b-2 border-lime-300 pb-0.5 hover:text-forest-800 transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {categories.map(cat => (
            <Link key={cat._id} to={`/shop/${cat.slug}`}
              className="flex flex-col items-center p-4 rounded-2xl border-2 border-transparent hover:border-forest-300 transition-all hover:-translate-y-1 cursor-pointer group"
              style={{ background: cat.color + '55' }}
            >
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">{cat.emoji}</span>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-cream py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">🔥 <span className="text-forest-600">Featured</span> Products</h2>
              <p className="text-gray-400 mt-1.5 text-sm">Handpicked fresh favourites</p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-forest-600 border-b-2 border-lime-300 pb-0.5 hover:text-forest-800">View All →</Link>
          </div>
          {featured.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({length:8}).map((_,i) => (
                <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100"/>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p._id} product={p}/>)}
            </div>
          )}
        </div>
      </section>

      {/* ── FLASH DEAL BANNER ── */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="bg-gradient-to-br from-forest-700 to-forest-900 rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center overflow-hidden relative">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none"/>
          <div>
            <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg mb-4 tracking-wider">⚡ FLASH DEAL</span>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Get <em className="text-lime-300 not-italic">30% OFF</em><br/>on All Fresh Fruits
            </h2>
            <p className="text-white/65 text-base mb-6 leading-relaxed">Limited time offer. Use code <strong className="text-lime-300">FRUITS30</strong> at checkout.</p>
            <button onClick={() => navigate('/shop/fruits')} className="btn-lime px-8 py-3.5 text-base rounded-xl">
              Shop Fruits Now →
            </button>
          </div>
          <div className="flex flex-col items-center gap-5">
            <div className="text-7xl">🍎🥭🍓</div>
            <Countdown initial={{ h:5, m:34, s:22 }}/>
            <p className="text-white/50 text-sm">Offer ends soon!</p>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      {newArrivals.length > 0 && (
        <section className="bg-cream py-14">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">✨ <span className="text-forest-600">New</span> Arrivals</h2>
                <p className="text-gray-400 mt-1.5 text-sm">Just added to our shelves</p>
              </div>
              <Link to="/shop?badge=new" className="text-sm font-semibold text-forest-600 border-b-2 border-lime-300 pb-0.5">View All →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {newArrivals.map(p => <ProductCard key={p._id} product={p}/>)}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="section-title">How <span className="text-forest-600">Grocify</span> Works</h2>
          <p className="text-gray-400 mt-2">Fresh groceries in 4 simple steps</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {icon:'📱',title:'Browse & Select',desc:'Explore thousands of fresh products filtered by category or preference.'},
            {icon:'🛒',title:'Add to Cart',desc:'Add items to your cart with real-time stock and pricing.'},
            {icon:'💳',title:'Easy Checkout',desc:'Pay via UPI, card, net banking or cash on delivery.'},
            {icon:'🚚',title:'Fast Delivery',desc:'Fresh order at your doorstep within 60 minutes.'},
          ].map((s,i) => (
            <div key={i} className="text-center p-6">
              <div className="relative w-16 h-16 bg-forest-50 border-3 border-forest-200 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                {s.icon}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-forest-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{i+1}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-cream py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="section-title">What Our <span className="text-forest-600">Customers</span> Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {name:'Priya Sharma',loc:'Ahmedabad',text:'Grocify has completely changed how I shop. Everything is so fresh and delivery is incredibly fast!',r:5,av:'PS',c:'#d8f3dc',tc:'#1b4332'},
              {name:'Rohan Mehta',loc:'Surat',text:'The organic section is fantastic. I love locally sourced produce. The app is super easy to use.',r:5,av:'RM',c:'#e0f4ff',tc:'#1a5276'},
              {name:'Anjali Patel',loc:'Vadodara',text:'Been ordering 6 months. Quality is consistently great, prices better than my local market!',r:5,av:'AP',c:'#fff3e0',tc:'#b7600d'},
            ].map((t,i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card hover:shadow-hover transition-shadow">
                <div className="text-amber-400 text-lg mb-3">{'★'.repeat(t.r)}</div>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{background:t.c,color:t.tc}}>{t.av}</div>
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{t.name}</div>
                    <div className="text-xs text-gray-400">📍 {t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP BANNER ── */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="bg-forest-700 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 justify-between">
          <div className="max-w-lg">
            <h2 className="font-display text-4xl font-black text-white mb-4">📱 Download the Grocify App</h2>
            <p className="text-white/65 text-base leading-relaxed mb-7">
              Get exclusive app-only deals, track your order in real-time, and enjoy a seamless grocery experience.
            </p>
            <div className="flex gap-3 flex-wrap">
              {['🍎 App Store','🤖 Google Play'].map(b => (
                <button key={b} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors">
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="text-[90px]">📲</div>
        </div>
      </section>

      {/* ── BRANDS ── */}
      <div className="bg-forest-50 border-y border-forest-100 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-around flex-wrap gap-4">
          {['Amul','Nestlé','Patanjali','Haldiram\'s','MDH Masala','Tata Foods','Mother Dairy','Britannia'].map(b => (
            <span key={b} className="text-sm font-bold text-forest-600/50 uppercase tracking-widest">{b}</span>
          ))}
        </div>
      </div>

      {/* ── NEWSLETTER ── */}
      <section className="bg-forest-600 py-14 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-3xl font-black text-white mb-3">🌿 Stay Fresh with Grocify</h2>
          <p className="text-white/60 mb-7">Subscribe for weekly fresh deals, seasonal recipes and exclusive offers.</p>
          <div className="flex gap-2">
            <input className="flex-1 bg-white/10 border-2 border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm outline-none focus:border-lime-300 transition-colors" placeholder="Enter your email address…"/>
            <button className="bg-lime-300 text-forest-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-white transition-colors whitespace-nowrap">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  )
}
