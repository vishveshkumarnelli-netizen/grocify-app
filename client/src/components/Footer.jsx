import { Link } from 'react-router-dom'
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi'

export default function Footer() {
  const cols = [
    { title:'Quick Links', links:[['/',          'Home'],['shop','Shop Now'],['/shop?badge=sale','Offers & Deals'],['/orders','Track Order']] },
    { title:'Categories',  links:[['/shop/vegetables','🥦 Vegetables'],['/shop/fruits','🍎 Fruits'],['/shop/dairy-eggs','🥛 Dairy & Eggs'],['/shop/grains','🌾 Grains'],['/shop/bakery','🍞 Bakery']] },
    { title:'Support',     links:[['#','Help Center'],['#','Contact Us'],['#','Delivery Info'],['#','Return Policy'],['#','Privacy Policy']] },
  ]

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-forest-400 to-forest-700 rounded-xl flex items-center justify-center text-xl">🥦</div>
              <span className="font-display text-2xl font-bold text-white">Grocify</span>
            </div>
            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              India's freshest online grocery store. Farm-to-doorstep in under 60 minutes, serving 50,000+ happy families across Gujarat.
            </p>
            <div className="flex gap-2">
              {[[FiFacebook,'#'],[FiInstagram,'#'],[FiTwitter,'#'],[FiYoutube,'#']].map(([Icon, href], i) => (
                <a key={i} href={href} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-forest-600 flex items-center justify-center transition-colors">
                  <Icon size={15}/>
                </a>
              ))}
            </div>
          </div>

          {cols.map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(([href, label]) => (
                  <li key={label}>
                    <Link to={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© 2026 Grocify. All rights reserved.</p>
          <div className="flex gap-2">
            {['UPI','Visa','Mastercard','PhonePe','COD'].map(p => (
              <span key={p} className="px-2.5 py-1 bg-white/5 rounded-md text-[10px] font-semibold text-gray-400">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
