import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiSave, FiPackage } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getProduct, createProduct, updateProduct, getCategories } from '../services/api'

const EMOJIS = ['🍅','🥦','🥕','🍎','🥭','🍓','🍋','🥬','🧅','🧄','🥑','🍇','🍉','🍌','🍑','🥝',
  '🥚','🧀','🥛','🧈','🍞','🌾','🫘','🥜','🫙','🥥','🌽','🫑','🧃','🍵']

export default function ProductForm() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const isEdit    = Boolean(id)

  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', originalPrice: '',
    unit: 'per kg', emoji: '🥦', category: '', badge: '', stock: '',
    isFeatured: false, isActive: true, tags: '',
    nutritionInfo: { calories:'', protein:'', carbs:'', fat:'', fiber:'' },
  })

  useEffect(() => {
    getCategories().then(d => setCategories(d.categories || []))
    if (isEdit) {
      setLoading(true)
      getProduct(id)
        .then(d => {
          const p = d.product
          setForm({
            name: p.name, slug: p.slug, description: p.description,
            price: p.price, originalPrice: p.originalPrice || '',
            unit: p.unit, emoji: p.emoji || '🥦',
            category: p.category?._id || '', badge: p.badge || '',
            stock: p.stock, isFeatured: p.isFeatured, isActive: p.isActive,
            tags: (p.tags || []).join(', '),
            nutritionInfo: p.nutritionInfo || { calories:'', protein:'', carbs:'', fat:'', fiber:'' },
          })
        })
        .finally(() => setLoading(false))
    }
  }, [id])

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setNut = (key, val) => setForm(f => ({ ...f, nutritionInfo: { ...f.nutritionInfo, [key]: val } }))

  const autoSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleNameChange = (e) => {
    const name = e.target.value
    setForm(f => ({ ...f, name, ...(!isEdit ? { slug: autoSlug(name) } : {}) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category || !form.stock) {
      toast.error('Please fill all required fields'); return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock:         Number(form.stock),
        tags:          form.tags.split(',').map(t => t.trim()).filter(Boolean),
        badge:         form.badge || null,
      }
      if (isEdit) {
        await updateProduct(id, payload)
        toast.success('Product updated!')
      } else {
        await createProduct(payload)
        toast.success('Product created!')
      }
      navigate('/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="p-8">
      <div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse mb-6"/>
      <div className="grid grid-cols-2 gap-6"><div className="h-96 bg-gray-100 rounded-2xl animate-pulse"/><div className="h-96 bg-gray-100 rounded-2xl animate-pulse"/></div>
    </div>
  )

  return (
    <div className="p-7 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-7">
        <Link to="/products" className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500">
          <FiArrowLeft size={18}/>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isEdit ? `Editing: ${form.name}` : 'Fill in the details below'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── LEFT: Main Info ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-gray-800 border-b border-gray-100 pb-3">Basic Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Product Name *</label>
                  <input value={form.name} onChange={handleNameChange} className="input" placeholder="e.g. Organic Tomatoes" required/>
                </div>
                <div className="col-span-2">
                  <label className="label">Slug (URL)</label>
                  <input value={form.slug} onChange={e => setF('slug', e.target.value)} className="input" placeholder="organic-tomatoes"/>
                  <p className="text-[11px] text-gray-400 mt-1">Used in URLs. Auto-generated from name.</p>
                </div>
                <div className="col-span-2">
                  <label className="label">Description *</label>
                  <textarea rows={4} value={form.description} onChange={e => setF('description', e.target.value)}
                    className="input resize-none" placeholder="Describe the product in detail…" required/>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-gray-800 border-b border-gray-100 pb-3">Pricing & Stock</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setF('price', e.target.value)}
                    className="input" placeholder="0" required min="0"/>
                </div>
                <div>
                  <label className="label">Original Price (₹)</label>
                  <input type="number" value={form.originalPrice} onChange={e => setF('originalPrice', e.target.value)}
                    className="input" placeholder="0 (optional)" min="0"/>
                  <p className="text-[11px] text-gray-400 mt-1">For showing discount</p>
                </div>
                <div>
                  <label className="label">Stock Qty *</label>
                  <input type="number" value={form.stock} onChange={e => setF('stock', e.target.value)}
                    className="input" placeholder="0" required min="0"/>
                </div>
                <div>
                  <label className="label">Unit</label>
                  <select value={form.unit} onChange={e => setF('unit', e.target.value)} className="input">
                    {['per kg','per 500g','per 250g','per 100g','per dozen','per piece','per bunch','per loaf','per litre','per 500ml','per 200g','per 100ml'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Nutrition Info */}
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-gray-800 border-b border-gray-100 pb-3">Nutrition Info (Optional)</h2>
              <div className="grid grid-cols-5 gap-3">
                {['calories','protein','carbs','fat','fiber'].map(key => (
                  <div key={key}>
                    <label className="label capitalize">{key}</label>
                    <input value={form.nutritionInfo[key]} onChange={e => setNut(key, e.target.value)}
                      className="input text-xs" placeholder={key === 'calories' ? 'kcal' : 'g'}/>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Meta ── */}
          <div className="space-y-5">
            {/* Preview */}
            <div className="card p-5 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-forest-50 to-lime-100 rounded-2xl flex items-center justify-center text-6xl mx-auto mb-3 border-2 border-forest-100 cursor-pointer relative"
                onClick={() => setShowEmojiPicker(v => !v)}>
                {form.emoji}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-forest-600 text-white rounded-full text-xs flex items-center justify-center">✏</div>
              </div>
              <p className="text-xs text-gray-400 mb-3">Click to change emoji</p>

              {showEmojiPicker && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3">
                  <div className="grid grid-cols-6 gap-1">
                    {EMOJIS.map(e => (
                      <button key={e} type="button" onClick={() => { setF('emoji', e); setShowEmojiPicker(false) }}
                        className={`text-xl p-1.5 rounded-lg hover:bg-white transition-colors ${form.emoji === e ? 'bg-white ring-2 ring-forest-400' : ''}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="font-display font-bold text-gray-800 text-base">{form.name || 'Product Name'}</p>
              {form.price && <p className="text-forest-700 font-bold text-lg">₹{form.price}</p>}
            </div>

            {/* Category & Badge */}
            <div className="card p-5 space-y-4">
              <h2 className="font-display font-bold text-gray-800">Classification</h2>
              <div>
                <label className="label">Category *</label>
                <select value={form.category} onChange={e => setF('category', e.target.value)} className="input" required>
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.emoji} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Badge</label>
                <select value={form.badge} onChange={e => setF('badge', e.target.value)} className="input">
                  <option value="">No badge</option>
                  <option value="sale">🔖 Sale</option>
                  <option value="new">✨ New</option>
                  <option value="best">🏆 Bestseller</option>
                  <option value="organic">🌿 Organic</option>
                </select>
              </div>
              <div>
                <label className="label">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setF('tags', e.target.value)}
                  className="input" placeholder="Organic, Fresh, Local"/>
              </div>
            </div>

            {/* Flags */}
            <div className="card p-5 space-y-3">
              <h2 className="font-display font-bold text-gray-800">Settings</h2>
              {[
                { key:'isFeatured', label:'⭐ Featured Product', desc:'Show on homepage' },
                { key:'isActive',   label:'✅ Active / Published', desc:'Visible in store' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <div onClick={() => setF(key, !form[key])}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form[key] ? 'bg-forest-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form[key] ? 'right-0.5' : 'left-0.5'}`}/>
                  </div>
                </label>
              ))}
            </div>

            {/* Save */}
            <button type="submit" disabled={saving} className="w-full btn-green justify-center py-3.5 text-base rounded-xl">
              {saving
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving…</>
                : <><FiSave size={16}/> {isEdit ? 'Save Changes' : 'Create Product'}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
