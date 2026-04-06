import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { registerUser } from '../services/api'
import { useAuthStore } from '../context/store'

export default function RegisterPage() {
  const navigate  = useNavigate()
  const { login } = useAuthStore()

  const [form, setForm]   = useState({ name:'', email:'', phone:'', password:'', confirm:'' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const setF = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const data = await registerUser({ name:form.name, email:form.email, phone:form.phone, password:form.password })
      login(data)
      toast.success(`Welcome to Grocify, ${form.name.split(' ')[0]}! 🎉`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const fields = [
    { name:'name',    label:'Full Name',      icon:FiUser,  type:'text',     placeholder:'Priya Sharma' },
    { name:'email',   label:'Email Address',  icon:FiMail,  type:'email',    placeholder:'you@example.com' },
    { name:'phone',   label:'Phone Number',   icon:FiPhone, type:'tel',      placeholder:'+91 98765 43210' },
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-cream">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8">
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-gradient-to-br from-forest-400 to-forest-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🥦</div>
            <h1 className="font-display text-3xl font-black text-gray-900">Create Account</h1>
            <p className="text-gray-400 text-sm mt-1">Join Grocify for fresh groceries</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, label, icon:Icon, type, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                  <input name={name} type={type} required value={form[name]} onChange={setF}
                    className="input-base pl-11" placeholder={placeholder}/>
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input name="password" type={showPass ? 'text' : 'password'} required value={form.password} onChange={setF}
                  className="input-base pl-11 pr-11" placeholder="Min. 6 characters"/>
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input name="confirm" type={showPass ? 'text' : 'password'} required value={form.confirm} onChange={setF}
                  className={`input-base pl-11 ${form.confirm && form.password !== form.confirm ? 'border-red-300 focus:border-red-400' : ''}`} placeholder="Repeat password"/>
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 rounded-xl text-base mt-2 disabled:opacity-60">
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Creating Account…</> : '🎉 Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-600 font-semibold hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
