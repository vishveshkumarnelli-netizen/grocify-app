import { useState } from 'react'
import { FiSave, FiShoppingBag, FiTruck, FiCreditCard, FiBell, FiShield, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAdminStore } from '../context/store'
import { updateProfile } from '../services/api'

const TABS = [
  { id:'general',       icon:FiShoppingBag, label:'General' },
  { id:'delivery',      icon:FiTruck,      label:'Delivery' },
  { id:'payment',       icon:FiCreditCard, label:'Payment' },
  { id:'notifications', icon:FiBell,       label:'Notifications' },
  { id:'account',       icon:FiUser,       label:'My Account' },
  { id:'security',      icon:FiShield,     label:'Security' },
]

function SectionTitle({ children }) {
  return <h3 className="font-display font-bold text-gray-800 text-base border-b border-gray-100 pb-3 mb-5">{children}</h3>
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-forest-600' : 'bg-gray-300'}`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? 'right-0.5' : 'left-0.5'}`}/>
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { admin, login } = useAdminStore()
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)

  const [general, setGeneral] = useState({
    storeName:   'Grocify',
    tagline:     'Fresh Groceries Delivered Fast',
    email:       'support@grocify.in',
    phone:       '+91 98765 43210',
    address:     '123, SG Highway, Ahmedabad, Gujarat 380054',
    currency:    'INR',
    timezone:    'Asia/Kolkata',
    language:    'en',
  })

  const [delivery, setDelivery] = useState({
    freeDeliveryAbove: '500',
    deliveryFee:       '40',
    minOrderValue:     '100',
    expressTime:       '60',
    maxDeliveryRadius: '10',
  })

  const [payToggle, setPayToggle] = useState({
    upi: true, card: true, netbanking: true, cod: true, wallet: false,
  })

  const [notifs, setNotifs] = useState({
    newOrderEmail: true, lowStockAlert: true, dailyReport: false,
    smsAlerts: false, pushNotifs: true,
  })

  const [account, setAccount] = useState({
    name:     admin?.name || '',
    email:    admin?.email || '',
    phone:    admin?.phone || '',
    password: '',
    confirm:  '',
  })

  const setG = e => setGeneral(f => ({ ...f, [e.target.name]: e.target.value }))
  const setD = e => setDelivery(f => ({ ...f, [e.target.name]: e.target.value }))
  const setA = e => setAccount(f => ({ ...f, [e.target.name]: e.target.value }))

  const save = async (section) => {
    setSaving(true)
    try {
      if (section === 'account') {
        if (account.password && account.password !== account.confirm) {
          toast.error("Passwords don't match"); setSaving(false); return
        }
        const payload = { name: account.name, email: account.email, phone: account.phone }
        if (account.password) payload.password = account.password
        const data = await updateProfile(payload)
        login({ user: data.user, token: data.token })
      }
      // In a real app, other sections would call dedicated API endpoints
      toast.success('Settings saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const inputCls = 'input'
  const labelCls = 'label'
  const rowCls   = 'grid grid-cols-2 gap-4'

  return (
    <div className="p-7 max-w-5xl">
      <div className="mb-7">
        <h1 className="font-display text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Configure your Grocify store</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <aside className="w-48 shrink-0">
          <div className="card p-2 space-y-0.5">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-forest-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <tab.icon size={15}/>
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <div className="card p-6">
            {/* ── GENERAL ── */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <SectionTitle>🏪 Store Information</SectionTitle>
                <div className={rowCls}>
                  <div><label className={labelCls}>Store Name</label><input name="storeName" value={general.storeName} onChange={setG} className={inputCls}/></div>
                  <div><label className={labelCls}>Tagline</label><input name="tagline" value={general.tagline} onChange={setG} className={inputCls}/></div>
                  <div><label className={labelCls}>Support Email</label><input name="email" type="email" value={general.email} onChange={setG} className={inputCls}/></div>
                  <div><label className={labelCls}>Phone</label><input name="phone" value={general.phone} onChange={setG} className={inputCls}/></div>
                </div>
                <div><label className={labelCls}>Address</label><input name="address" value={general.address} onChange={setG} className={inputCls}/></div>
                <div className={rowCls}>
                  <div>
                    <label className={labelCls}>Currency</label>
                    <select name="currency" value={general.currency} onChange={setG} className={inputCls}>
                      <option value="INR">INR (₹)</option><option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Timezone</label>
                    <select name="timezone" value={general.timezone} onChange={setG} className={inputCls}>
                      <option value="Asia/Kolkata">IST (GMT+5:30)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => save('general')} disabled={saving} className="btn-green mt-2">
                  <FiSave size={14}/> {saving ? 'Saving…' : 'Save General Settings'}
                </button>
              </div>
            )}

            {/* ── DELIVERY ── */}
            {activeTab === 'delivery' && (
              <div className="space-y-4">
                <SectionTitle>🚚 Delivery Configuration</SectionTitle>
                <div className={rowCls}>
                  <div>
                    <label className={labelCls}>Free Delivery Above (₹)</label>
                    <input name="freeDeliveryAbove" value={delivery.freeDeliveryAbove} onChange={setD} type="number" className={inputCls}/>
                    <p className="text-xs text-gray-400 mt-1">Orders above this get free delivery</p>
                  </div>
                  <div>
                    <label className={labelCls}>Delivery Fee (₹)</label>
                    <input name="deliveryFee" value={delivery.deliveryFee} onChange={setD} type="number" className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>Min. Order Value (₹)</label>
                    <input name="minOrderValue" value={delivery.minOrderValue} onChange={setD} type="number" className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>Express Delivery (mins)</label>
                    <input name="expressTime" value={delivery.expressTime} onChange={setD} type="number" className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>Max Delivery Radius (km)</label>
                    <input name="maxDeliveryRadius" value={delivery.maxDeliveryRadius} onChange={setD} type="number" className={inputCls}/>
                  </div>
                </div>
                <div className="bg-forest-50 rounded-xl p-4 text-sm text-forest-700">
                  <p className="font-semibold mb-1">💡 Current Settings</p>
                  <p>Free delivery on orders ≥ ₹{delivery.freeDeliveryAbove} · Fee: ₹{delivery.deliveryFee} · Express: {delivery.expressTime} min</p>
                </div>
                <button onClick={() => save('delivery')} disabled={saving} className="btn-green">
                  <FiSave size={14}/> Save Delivery Settings
                </button>
              </div>
            )}

            {/* ── PAYMENT ── */}
            {activeTab === 'payment' && (
              <div className="space-y-2">
                <SectionTitle>💳 Payment Methods</SectionTitle>
                {[
                  { id:'upi',        label:'📱 UPI / PhonePe / GPay',  desc:'Instant bank transfers via UPI' },
                  { id:'card',       label:'💳 Credit / Debit Cards',   desc:'Visa, Mastercard, RuPay' },
                  { id:'netbanking', label:'🏦 Net Banking',            desc:'All major Indian banks' },
                  { id:'cod',        label:'💵 Cash on Delivery',       desc:'Pay when order arrives' },
                  { id:'wallet',     label:'👜 Paytm Wallet',           desc:'Paytm wallet balance' },
                ].map(m => (
                  <Toggle key={m.id} label={m.label} desc={m.desc}
                    checked={payToggle[m.id]}
                    onChange={v => setPayToggle(p => ({ ...p, [m.id]: v }))}/>
                ))}
                <button onClick={() => save('payment')} disabled={saving} className="btn-green mt-4">
                  <FiSave size={14}/> Save Payment Settings
                </button>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === 'notifications' && (
              <div className="space-y-1">
                <SectionTitle>🔔 Notification Preferences</SectionTitle>
                {[
                  { id:'newOrderEmail', label:'New Order Email',     desc:'Email when a new order is placed' },
                  { id:'lowStockAlert', label:'Low Stock Alerts',    desc:'Alert when stock drops below 20 units' },
                  { id:'dailyReport',   label:'Daily Sales Report',  desc:'Receive daily summary at 9 AM' },
                  { id:'smsAlerts',     label:'SMS Alerts',          desc:'Critical alerts via SMS' },
                  { id:'pushNotifs',    label:'Push Notifications',  desc:'Browser push notifications' },
                ].map(n => (
                  <Toggle key={n.id} label={n.label} desc={n.desc}
                    checked={notifs[n.id]}
                    onChange={v => setNotifs(p => ({ ...p, [n.id]: v }))}/>
                ))}
                <button onClick={() => save('notifs')} disabled={saving} className="btn-green mt-4">
                  <FiSave size={14}/> Save Notification Settings
                </button>
              </div>
            )}

            {/* ── ACCOUNT ── */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <SectionTitle>👤 My Admin Account</SectionTitle>
                <div className="flex items-center gap-4 p-4 bg-forest-50 rounded-xl mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-forest-300 to-forest-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                    {admin?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{admin?.name}</p>
                    <p className="text-sm text-gray-500">{admin?.email}</p>
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full mt-1 inline-block">⚡ Super Admin</span>
                  </div>
                </div>
                <div className={rowCls}>
                  <div><label className={labelCls}>Full Name</label><input name="name" value={account.name} onChange={setA} className={inputCls}/></div>
                  <div><label className={labelCls}>Email</label><input name="email" type="email" value={account.email} onChange={setA} className={inputCls}/></div>
                  <div><label className={labelCls}>Phone</label><input name="phone" value={account.phone} onChange={setA} className={inputCls}/></div>
                </div>
                <div className={rowCls}>
                  <div><label className={labelCls}>New Password</label><input name="password" type="password" value={account.password} onChange={setA} className={inputCls} placeholder="Leave blank to keep"/></div>
                  <div><label className={labelCls}>Confirm Password</label><input name="confirm" type="password" value={account.confirm} onChange={setA} className={inputCls} placeholder="Repeat new password"/></div>
                </div>
                <button onClick={() => save('account')} disabled={saving} className="btn-green">
                  <FiSave size={14}/> {saving ? 'Saving…' : 'Update Account'}
                </button>
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <SectionTitle>🔒 Security Settings</SectionTitle>
                <div className="space-y-1">
                  {[
                    { label:'Two-Factor Authentication', desc:'Require 2FA for admin login' },
                    { label:'Session Timeout',           desc:'Auto-logout after 30 minutes of inactivity' },
                    { label:'IP Whitelisting',           desc:'Restrict admin access to specific IP addresses' },
                    { label:'Login Notifications',       desc:'Email on each successful admin login' },
                  ].map((s,i) => (
                    <Toggle key={i} label={s.label} desc={s.desc} checked={i<2} onChange={() => {}}/>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                  <p className="font-semibold mb-1">⚠️ Security Tip</p>
                  <p>Use a strong, unique password for your admin account and enable two-factor authentication for maximum security.</p>
                </div>
                <button onClick={() => save('security')} disabled={saving} className="btn-green">
                  <FiSave size={14}/> Save Security Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
