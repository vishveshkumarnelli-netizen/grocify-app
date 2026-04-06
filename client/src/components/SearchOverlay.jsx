import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiX, FiArrowRight } from 'react-icons/fi'
import { useUIStore } from '../context/store'
import { fetchProducts } from '../services/api'

export default function SearchOverlay() {
  const { searchOpen, closeSearch } = useUIStore()
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 100)
    else setQuery('')
  }, [searchOpen])

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await fetchProducts({ search: query, limit: 6 })
        setResults(data.products || [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const handleSelect = (slug) => { closeSearch(); navigate(`/product/${slug}`) }
  const handleSearch = () => { if (query) { closeSearch(); navigate(`/shop?search=${query}`) } }

  if (!searchOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm" onClick={closeSearch}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <FiSearch className="text-forest-500 shrink-0" size={20}/>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search for groceries, fruits, dairy…"
            className="flex-1 text-base outline-none placeholder-gray-400"
          />
          {query && <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600"><FiX size={18}/></button>}
          <button onClick={closeSearch} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 transition-colors"><FiX size={15}/></button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="py-8 text-center text-sm text-gray-400">Searching…</div>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="py-10 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-sm text-gray-500">No results for "<strong>{query}</strong>"</p>
            </div>
          )}
          {!loading && results.map(p => (
            <button key={p._id} onClick={() => handleSelect(p.slug)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-forest-50 transition-colors border-b border-gray-50 text-left">
              <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-2xl border border-forest-100 shrink-0">{p.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-400">{p.category?.name} · {p.unit}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-forest-700 text-sm">₹{p.price}</p>
                {p.originalPrice && <p className="text-xs text-gray-400 line-through">₹{p.originalPrice}</p>}
              </div>
            </button>
          ))}
          {query.length >= 2 && results.length > 0 && (
            <button onClick={handleSearch} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-forest-600 hover:bg-forest-50 transition-colors">
              See all results for "{query}" <FiArrowRight size={14}/>
            </button>
          )}
          {query.length < 2 && (
            <div className="px-4 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Tomatoes','Mangoes','Basmati Rice','Paneer','Eggs','Spinach','Bread','Bananas'].map(t => (
                  <button key={t} onClick={() => setQuery(t)} className="px-3 py-1.5 bg-forest-50 text-forest-700 rounded-full text-xs font-medium hover:bg-forest-100 transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
