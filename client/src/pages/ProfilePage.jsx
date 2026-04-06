import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiMapPin, FiPackage, FiEdit2, FiSave, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { updateProfile, addAddress } from '../services/api'
import { useAuthStore } from '../context/store'

export default function ProfilePage() {
  const { user, login } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [addingAddr, setAddingAddr] = useState(false)

  const [form, setForm] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    password: '',
  })

  const [addrForm, setAddrForm] = useState({
    label:'Home', street:'', city:'Ahmedabad', state:'Gujarat', pincode:'', isDefault:false,
  })

  const setF = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setA = (e) => setAddrForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { name:form.name, email:form.email, phone:form.phone }
      if (form.password) payload.password = form.password
      const data = await updateProfile(payload)
      login({ user: data.user, token: data.token })
      toast.success('Profile updated!')
      setEditing(false)
      setForm(f => ({...f, password:''}))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      await addAddress(addrForm)
      toast.success('Address saved!')
      setAddingAddr(false)
      setAddrForm({ label:'Home', street:'', city:'Ahmedabad', state:'Gujarat', pincode:'', isDefault:false })
    } catch { toast.error('Failed to save address') }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-black text-gray-900 mb-7">My Profile</h1>

      <div className="grid gap-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-forest-300 to-forest-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{user?.name}</h2>
                <p className="text-sm text-gray-400">{user?.email}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-forest-100 text-forest-700'}`}>
                  {user?.role === 'admin' ? '⚡ Admin' : '🌿 Customer'}
                </span>
              </div>
            </div>
            <button onClick={() => setEditing(v => !v)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${editing ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-forest-50 text-forest-700 hover:bg-forest-100'}`}>
              {editing ? <><FiX size={14}/> Cancel</> : <><FiEdit2 size={14}/> Edit</>}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/><input name="name" value={form.name} onChange={setF} className="input-base pl-9 text-sm py-2.5"/></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative"><FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/><input name="email" type="email" value={form.email} onChange={setF} className="input-base pl-9 text-sm py-2.5"/></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone</label>
                  <div className="relative"><FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/><input name="phone" value={form.phone} onChange={setF} className="input-base pl-9 text-sm py-2.5"/></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <input name="password" type="password" value={form.password} onChange={setF} className="input-base text-sm py-2.5" placeholder="Leave blank to keep"/>
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5 rounded-xl">
                {saving ? 'Saving…' : <><FiSave size={14}/> Save Changes</>}
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                [FiUser,'Name',user?.name],
                [FiMail,'Email',user?.email],
                [FiPhone,'Phone',user?.phone || '—'],
              ].map(([Icon,label,val]) => (
                <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <Icon size={15} className="text-forest-500 shrink-0"/>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</div>
                    <div className="font-medium text-gray-800 mt-0.5">{val}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <FiPackage size={15} className="text-forest-500 shrink-0"/>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Orders</div>
                  <Link to="/orders" className="font-medium text-forest-600 hover:underline text-sm mt-0.5 block">View All →</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Saved Addresses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><FiMapPin size={16} className="text-forest-500"/> Saved Addresses</h2>
            <button onClick={() => setAddingAddr(v => !v)} className="text-xs font-bold text-forest-600 hover:text-forest-800 bg-forest-50 px-3 py-1.5 rounded-lg">
              {addingAddr ? '✕ Cancel' : '+ Add New'}
            </button>
          </div>

          {addingAddr && (
            <form onSubmit={handleAddAddress} className="mb-5 p-4 bg-forest-50 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Label</label>
                  <select name="label" value={addrForm.label} onChange={setA} className="input-base text-sm py-2">
                    <option>Home</option><option>Work</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Pincode</label>
                  <input name="pincode" value={addrForm.pincode} onChange={setA} className="input-base text-sm py-2" placeholder="380054"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Street Address</label>
                  <input name="street" value={addrForm.street} onChange={setA} className="input-base text-sm py-2" placeholder="Building, Street, Area"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
                  <input name="city" value={addrForm.city} onChange={setA} className="input-base text-sm py-2"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">State</label>
                  <input name="state" value={addrForm.state} onChange={setA} className="input-base text-sm py-2"/>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" name="isDefault" checked={addrForm.isDefault} onChange={setA} className="accent-forest-600"/>
                Set as default address
              </label>
              <button type="submit" className="btn-primary text-sm px-5 py-2.5 rounded-xl">Save Address</button>
            </form>
          )}

          {user?.addresses?.length === 0 || !user?.addresses ? (
            <p className="text-sm text-gray-400 text-center py-6">No saved addresses yet</p>
          ) : (
            <div className="space-y-3">
              {user.addresses.map((addr, i) => (
                <div key={i} className={`p-4 rounded-xl border-2 ${addr.isDefault ? 'border-forest-300 bg-forest-50' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-forest-700 bg-forest-100 px-2 py-0.5 rounded-md">{addr.label}</span>
                      {addr.isDefault && <span className="ml-2 text-xs text-green-600 font-semibold">✔ Default</span>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">{addr.street}, {addr.city}, {addr.state} – {addr.pincode}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
