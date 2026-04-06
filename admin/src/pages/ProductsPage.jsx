import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiStar, FiFilter,
  FiChevronDown, FiCheckSquare, FiEye, FiAlertTriangle, FiRefreshCw
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getProducts, deleteProduct, bulkProducts, getCategories } from '../services/api'

const BADGE_COLORS = {
  sale:    'badge-red',
  new:     'badge-green',
  best:    'badge-amber',
  organic: 'badge-green',
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [pagination,  setPagination]  = useState({ page:1, pages:1, total:0 })
  const [selected,    setSelected]    = useState([])
  const [showConfirm, setShowConfirm] = useState(null)

  const [filters, setFilters] = useState({
    search: '', category: '', badge: '', sort: 'newest', page: 1, limit: 15,
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { ...filters }
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const data = await getProducts(params)
      setProducts(data.products || [])
      setPagination({ page: data.page, pages: data.pages, total: data.total })
    } catch { toast.error('Failed to load products') }
    finally  { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])
  useEffect(() => { getCategories().then(d => setCategories(d.categories || [])) }, [])

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      setShowConfirm(null)
      load()
    } catch { toast.error('Failed to delete') }
  }

  const handleBulk = async (action) => {
    if (!selected.length) return
    try {
      await bulkProducts({ action, ids: selected })
      toast.success(`Bulk ${action} applied`)
      setSelected([])
      load()
    } catch { toast.error('Bulk action failed') }
  }

  const toggleSelect = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const toggleAll = () =>
    setSelected(selected.length === products.length ? [] : products.map(p => p._id))

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }))

  return (
    <div className="p-7 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{pagination.total} products in store</p>
        </div>
        <Link to="/products/new" className="btn-green">
          <FiPlus size={16}/> Add Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
          <input value={filters.search} onChange={e => setFilter('search', e.target.value)}
            className="input pl-9 py-2 text-sm" placeholder="Search products…"/>
        </div>

        {/* Category filter */}
        <select value={filters.category} onChange={e => setFilter('category', e.target.value)}
          className="input py-2 text-sm w-40">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.emoji} {c.name}</option>)}
        </select>

        {/* Badge filter */}
        <select value={filters.badge} onChange={e => setFilter('badge', e.target.value)}
          className="input py-2 text-sm w-36">
          <option value="">All Badges</option>
          {['sale','new','best','organic'].map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        {/* Sort */}
        <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)}
          className="input py-2 text-sm w-44">
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Top Rated</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>

        <button onClick={load} className="btn-ghost btn-sm"><FiRefreshCw size={13}/></button>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="bg-forest-50 border border-forest-200 rounded-xl px-4 py-3 flex items-center gap-4">
          <span className="text-sm font-semibold text-forest-700">{selected.length} selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulk('feature')}   className="btn-green btn-sm">⭐ Feature</button>
            <button onClick={() => handleBulk('unfeature')} className="btn-ghost btn-sm">Unfeature</button>
            <button onClick={() => handleBulk('delete')}    className="btn-red btn-sm">🗑 Delete All</button>
          </div>
          <button onClick={() => setSelected([])} className="ml-auto text-xs text-gray-500 hover:text-gray-700">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th w-10">
                  <input type="checkbox" className="rounded accent-forest-600"
                    checked={selected.length === products.length && products.length > 0}
                    onChange={toggleAll}/>
                </th>
                {['Product','Category','Price','Stock','Badge','Sales','Rating','Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:8}).map((_,i) => (
                  <tr key={i}><td colSpan={9} className="table-td">
                    <div className="h-5 bg-gray-100 rounded animate-pulse"/>
                  </td></tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={9} className="table-td text-center py-16 text-gray-400">
                  <div className="text-4xl mb-2">📦</div>
                  <p>No products found</p>
                </td></tr>
              ) : products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="table-td">
                    <input type="checkbox" className="rounded accent-forest-600"
                      checked={selected.includes(p._id)}
                      onChange={() => toggleSelect(p._id)}/>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center text-2xl border border-forest-100 shrink-0">
                        {p.emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-xs text-gray-500">{p.category?.name}</td>
                  <td className="table-td">
                    <span className="font-display font-bold text-forest-700">₹{p.price}</span>
                    {p.originalPrice && <span className="text-xs text-gray-400 line-through ml-1">₹{p.originalPrice}</span>}
                  </td>
                  <td className="table-td">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.stock === 0 ? 'bg-red-50 text-red-600' :
                      p.stock < 20  ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {p.stock === 0 ? 'Out' : p.stock}
                    </span>
                  </td>
                  <td className="table-td">
                    {p.badge
                      ? <span className={`badge ${BADGE_COLORS[p.badge] || 'badge-gray'} uppercase`}>{p.badge}</span>
                      : <span className="text-gray-300 text-xs">—</span>
                    }
                  </td>
                  <td className="table-td text-gray-600">{p.sold || 0}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-1 text-amber-400">
                      <FiStar size={12} className="fill-amber-400"/>
                      <span className="text-xs font-semibold text-gray-700">{p.rating?.toFixed(1) || '—'}</span>
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/products/edit/${p._id}`}
                        className="p-1.5 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors">
                        <FiEdit2 size={14}/>
                      </Link>
                      <button onClick={() => setShowConfirm(p)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {(filters.page-1)*filters.limit+1}–{Math.min(filters.page*filters.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-1">
              {Array.from({length: pagination.pages}, (_,i) => i+1).map(pg => (
                <button key={pg} onClick={() => setFilters(f => ({...f, page:pg}))}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    filters.page === pg ? 'bg-forest-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>{pg}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle size={22} className="text-red-500"/>
            </div>
            <h3 className="font-display font-bold text-lg text-center mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Are you sure you want to delete <strong>"{showConfirm.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={() => handleDelete(showConfirm._id)} className="btn-red flex-1 justify-center">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
