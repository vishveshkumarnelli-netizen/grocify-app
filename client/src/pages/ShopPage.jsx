import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
import { fetchProducts, fetchCategories } from '../services/api'

export default function ShopPage() {
  const { category: catSlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 })
  const [filterOpen, setFilterOpen] = useState(false)

  const [filters, setFilters] = useState({
    search:   searchParams.get('search') || '',
    badge:    searchParams.get('badge')  || '',
    minPrice: '',
    maxPrice: '',
    sort:     'popular',
    page:     1,
  })

  const activeCategory = catSlug || searchParams.get('category') || ''

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const catId = activeCategory
        ? categories.find(c => c.slug === activeCategory)?._id
        : undefined

      const params = {
        ...filters,
        ...(catId ? { category: catId } : {}),
        limit: 12,
      }
      Object.keys(params).forEach(k => !params[k] && delete params[k])

      const data = await fetchProducts(params)
      setProducts(data.products || [])
      setPagination({ page: data.page, pages: data.pages, total: data.total })
    } catch { setProducts([]) }
    finally   { setLoading(false) }
  }, [filters, activeCategory, categories])

  useEffect(() => {
    fetchCategories().then(d => setCategories(d.categories || []))
  }, [])

  useEffect(() => {
    if (categories.length) loadProducts()
  }, [loadProducts, categories])

  const sortOptions = [
    { value:'popular',    label:'Most Popular' },
    { value:'rating',     label:'Top Rated' },
    { value:'newest',     label:'Newest First' },
    { value:'price-asc',  label:'Price: Low → High' },
    { value:'price-desc', label:'Price: High → Low' },
  ]

  const badgeFilters = [
    { value:'',      label:'All Products' },
    { value:'sale',  label:'🔖 On Sale' },
    { value:'new',   label:'✨ New Arrivals' },
    { value:'best',  label:'🏆 Bestsellers' },
    { value:'organic',label:'🌿 Organic' },
  ]

  const currentCat = categories.find(c => c.slug === activeCategory)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-forest-600 font-medium">Home</Link>
        <span>›</span>
        <Link to="/shop" className="hover:text-forest-600 font-medium">Shop</Link>
        {currentCat && <><span>›</span><span className="text-gray-700 font-medium">{currentCat.emoji} {currentCat.name}</span></>}
      </nav>

      <div className="flex gap-7">
        {/* ── SIDEBAR FILTERS ── */}
        <aside className={`shrink-0 w-56 ${filterOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800">Filters</h3>
              <button onClick={() => setFilters(f => ({...f, badge:'', minPrice:'', maxPrice:''}))} className="text-xs text-red-400 hover:text-red-600">Clear All</button>
            </div>

            {/* Category */}
            <div className="mb-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Category</p>
              <div className="space-y-1">
                <Link to="/shop" className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!activeCategory ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>All Products</Link>
                {categories.map(cat => (
                  <Link key={cat._id} to={`/shop/${cat.slug}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat.slug ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span>{cat.emoji}</span>{cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Badge/Deal filter */}
            <div className="mb-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Deals</p>
              <div className="space-y-1">
                {badgeFilters.map(b => (
                  <label key={b.value} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="badge" checked={filters.badge === b.value} onChange={() => setFilters(f => ({...f, badge:b.value, page:1}))} className="accent-forest-600 w-3.5 h-3.5"/>
                    {b.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Price Range</p>
              <div className="flex gap-2">
                <input value={filters.minPrice} onChange={e => setFilters(f => ({...f, minPrice:e.target.value}))} placeholder="Min" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-forest-400"/>
                <input value={filters.maxPrice} onChange={e => setFilters(f => ({...f, maxPrice:e.target.value}))} placeholder="Max" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-forest-400"/>
              </div>
            </div>

            {/* Rating */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Rating</p>
              {[4,3,2].map(r => (
                <label key={r} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="accent-forest-600 w-3.5 h-3.5"/>
                  <span className="text-amber-400">{'★'.repeat(r)}{'☆'.repeat(5-r)}</span> & above
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ── PRODUCTS AREA ── */}
        <main className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => setFilterOpen(v => !v)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                <FiFilter size={14}/> Filters
              </button>
              <p className="text-sm text-gray-500">
                Showing <strong className="text-gray-800">{pagination.total}</strong> products
                {currentCat && <span> in <strong className="text-forest-600">{currentCat.name}</strong></span>}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick category pills */}
              <div className="hidden md:flex items-center gap-1.5">
                <Link to="/shop" className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${!activeCategory ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</Link>
                {categories.slice(0,5).map(c => (
                  <Link key={c._id} to={`/shop/${c.slug}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeCategory === c.slug ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {c.emoji} {c.name}
                  </Link>
                ))}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={e => setFilters(f => ({...f, sort:e.target.value, page:1}))}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-forest-400 cursor-pointer"
                >
                  {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14}/>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({length:12}).map((_,i) => (
                <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100"/>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-sm text-gray-400 mb-5">Try adjusting your filters</p>
              <button onClick={() => setFilters({search:'',badge:'',minPrice:'',maxPrice:'',sort:'popular',page:1})} className="btn-primary px-6 py-2.5 text-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p}/>)}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({length: pagination.pages}, (_,i) => i+1).map(pg => (
                    <button key={pg} onClick={() => setFilters(f => ({...f, page:pg}))}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${filters.page === pg ? 'bg-forest-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-forest-50'}`}>
                      {pg}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
