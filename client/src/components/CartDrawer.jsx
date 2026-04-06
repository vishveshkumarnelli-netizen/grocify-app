import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi'
import { useCartStore, useUIStore } from '../context/store'
import { useAuthStore } from '../context/store'
import { useNavigate } from 'react-router-dom'

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore()
  const { items, removeItem, updateQty } = useCartStore()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const cartTotal   = items.reduce((s, i) => s + i.price * i.qty, 0)
  const deliveryFee = cartTotal >= 500 ? 0 : 40
  const grandTotal  = cartTotal + deliveryFee

  const handleCheckout = () => {
    closeCart()
    if (!user) navigate('/login?redirect=checkout')
    else navigate('/checkout')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-display text-xl font-bold">Your Cart</h2>
            <p className="text-xs text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={closeCart} className="w-9 h-9 bg-forest-50 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center transition-colors">
            <FiX size={18}/>
          </button>
        </div>

        {/* Free delivery progress */}
        {cartTotal < 500 && cartTotal > 0 && (
          <div className="mx-5 mt-3 bg-forest-50 rounded-xl p-3">
            <p className="text-xs text-forest-600 font-medium mb-1.5">
              Add <span className="font-bold">₹{500 - cartTotal}</span> more for free delivery 🚚
            </p>
            <div className="h-1.5 bg-forest-200 rounded-full overflow-hidden">
              <div className="h-full bg-forest-500 rounded-full transition-all" style={{ width: `${(cartTotal / 500) * 100}%` }}/>
            </div>
          </div>
        )}
        {cartTotal >= 500 && (
          <div className="mx-5 mt-3 bg-green-50 rounded-xl px-3 py-2 text-xs text-green-700 font-semibold">
            🎉 You've unlocked FREE delivery!
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="font-semibold text-gray-700 mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-400 mb-6">Add fresh groceries to get started</p>
              <button onClick={() => { closeCart(); navigate('/shop') }} className="btn-primary text-sm px-5 py-2.5">
                Browse Shop
              </button>
            </div>
          ) : items.map(item => (
            <div key={item._id} className="flex gap-3 bg-gray-50 rounded-2xl p-3">
              <div className="w-16 h-16 bg-forest-50 rounded-xl flex items-center justify-center text-3xl shrink-0 border border-forest-100">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.unit}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border-2 border-forest-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center text-forest-600 hover:bg-forest-50 transition-colors"><FiMinus size={12}/></button>
                    <span className="w-8 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                    <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center text-forest-600 hover:bg-forest-50 transition-colors"><FiPlus size={12}/></button>
                  </div>
                  <span className="font-display font-bold text-forest-700">₹{item.price * item.qty}</span>
                </div>
              </div>
              <button onClick={() => removeItem(item._id)} className="self-start p-1.5 text-gray-300 hover:text-red-400 transition-colors"><FiTrash2 size={14}/></button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery</span>
              <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total</span><span className="font-display text-forest-700 text-lg">₹{grandTotal}</span>
            </div>
            <button onClick={handleCheckout} className="w-full bg-forest-600 hover:bg-forest-500 text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <FiShoppingBag size={16}/> Proceed to Checkout
            </button>
            <button onClick={() => { closeCart(); navigate('/shop') }} className="w-full text-center text-sm text-forest-600 hover:text-forest-800 font-medium">
              Continue Shopping →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
