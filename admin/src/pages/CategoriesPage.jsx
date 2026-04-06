import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiAlertTriangle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api'

const EMOJIS = ['🥦','🍎','🥛','🌾','🍞','🫙','🍿','🧃','🥕','🧅','🫑','🥑','🍇','🥚','🧀','🧈','🌽','🍉','🥭','🍓']
const COLORS  = ['#d8f3dc','#fff3e0','#e0f4ff','#fef9c3','#fce8d8','#f3e8ff','#fde8e8','#e0f5f4','#f0fdf4','#fdf2f8']

const DEFAULT_FORM = { name:'', slug:'', emoji:'🥦', color:'#d8f3dc', description:'', sortOrder:0 }

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
}

export default function CategoriesPage() {
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [editingId,   setEditingId]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [form,        setForm]        = useState(DEFAULT_FORM)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCategories()
      setCategories(data.categories || [])
    } catch { toast.error('Failed to load categories') }
    finally  { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm(DEFAULT_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, emoji: cat.emoji, color: cat.color, description: cat.description || '', sortOrder: cat.sortOrder || 0 })
    setEditingId(cat._id)
    setShowForm(true)
  }

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleNameChange = (e) => {
    const name = e.target.value
    setForm(f => ({ ...f, name, ...(!editingId ? { slug: slugify(name) } : {}) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.slug) { toast.error('Name and slug are required'); return }
    setSaving(true)
    try {
      if (editingId) {
        await updateCategory(editingId, form)
        toast.success('Category updated!')
      } else {
        await createCategory(form)
        toast.success('Category created!')
      }
      setShowForm(false)
      setEditingId(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteTarget._id)
      toast.success('Category deleted')
      setDeleteTarget(null)
      load()
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900">Categories</h1>
          <p className="text-sm text-gray-400 mt-0.5">{categories.length} categories</p>
        </div>
        <button onClick={openNew} className="btn-green"><FiPlus size={16}/> Add Category</button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({length:8}).map((_,i) => <div key={i} className="card h-40 animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="card group overflow-hidden hover:shadow-panel transition-shadow">
              {/* Color header */}
              <div className="h-24 flex items-center justify-center text-5xl relative" style={{ background: cat.color }}>
                <span className="group-hover:scale-110 transition-transform duration-200">{cat.emoji}</span>
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => openEdit(cat)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-forest-600 hover:bg-forest-600 hover:text-white transition-colors shadow-md">
                    <FiEdit2 size={13}/>
                  </button>
                  <button onClick={() => setDeleteTarget(cat)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-md">
                    <FiTrash2 size={13}/>
                  </button>
                </div>
              </div>
              <div className="p-3.5">
                <p className="font-bold text-gray-800 text-sm truncate">{cat.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{cat.slug}</p>
                {cat.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{cat.description}</p>}
              </div>
            </div>
          ))}

          {/* Add new card */}
          <button onClick={openNew} className="card border-2 border-dashed border-gray-200 h-full min-h-[160px] flex flex-col items-center justify-center gap-2 hover:border-forest-400 hover:bg-forest-50 transition-all group">
            <div className="w-10 h-10 bg-gray-100 group-hover:bg-forest-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-forest-600 transition-colors">
              <FiPlus size={20}/>
            </div>
            <span className="text-xs font-semibold text-gray-400 group-hover:text-forest-600">Add Category</span>
          </button>
        </div>
      )}

      {/* ── FORM MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-bold text-gray-800">{editingId ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"><FiX size={18}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: form.color }}>
                <div className="text-5xl">{form.emoji}</div>
                <div>
                  <p className="font-bold text-gray-800">{form.name || 'Category Name'}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">/{form.slug || 'slug'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Name *</label>
                  <input value={form.name} onChange={handleNameChange} className="input" placeholder="Vegetables" required/>
                </div>
                <div className="col-span-2">
                  <label className="label">Slug *</label>
                  <input value={form.slug} onChange={e => setF('slug', e.target.value)} className="input" placeholder="vegetables" required/>
                </div>
                <div className="col-span-2">
                  <label className="label">Description</label>
                  <input value={form.description} onChange={e => setF('description', e.target.value)} className="input" placeholder="Fresh farm vegetables…"/>
                </div>
                <div>
                  <label className="label">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setF('sortOrder', Number(e.target.value))} className="input" min="0"/>
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <label className="label">Emoji</label>
                <div className="flex flex-wrap gap-1.5 bg-gray-50 rounded-xl p-3">
                  {EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setF('emoji', e)}
                      className={`text-2xl p-1.5 rounded-lg transition-colors hover:bg-white ${form.emoji === e ? 'bg-white ring-2 ring-forest-400 shadow-sm' : ''}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="label">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setF('color', c)}
                      className={`w-8 h-8 rounded-xl border-2 transition-all ${form.color === c ? 'border-forest-600 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ background: c }}/>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-green flex-1 justify-center">
                  {saving ? 'Saving…' : <><FiSave size={14}/> {editingId ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-5xl text-center mb-3">{deleteTarget.emoji}</div>
            <h3 className="font-display font-bold text-lg text-center mb-2">Delete Category?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Delete <strong>"{deleteTarget.name}"</strong>? Products in this category won't be deleted but will lose their category.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={handleDelete} className="btn-red flex-1 justify-center">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
