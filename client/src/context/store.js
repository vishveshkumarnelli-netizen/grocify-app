import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── CART STORE ─────────────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        const { items } = get()
        const existing = items.find(i => i._id === product._id)
        if (existing) {
          set({ items: items.map(i => i._id === product._id ? { ...i, qty: i.qty + qty } : i) })
        } else {
          set({ items: [...items, { ...product, qty }] })
        }
      },

      removeItem: (id) =>
        set(s => ({ items: s.items.filter(i => i._id !== id) })),

      updateQty: (id, qty) => {
        if (qty < 1) return get().removeItem(id)
        set(s => ({ items: s.items.map(i => i._id === id ? { ...i, qty } : i) }))
      },

      clearCart: () => set({ items: [] }),

      get cartCount() { return get().items.reduce((s, i) => s + i.qty, 0) },
      get cartTotal() { return get().items.reduce((s, i) => s + i.price * i.qty, 0) },
      get deliveryFee() { return get().cartTotal >= 500 ? 0 : 40 },
      get grandTotal()  { return get().cartTotal + get().deliveryFee },
    }),
    { name: 'grocify-cart' }
  )
)

// ── AUTH STORE ─────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user:  null,
      token: null,

      login: ({ user, token }) => {
        localStorage.setItem('grocify_token', token)
        set({ user, token })
      },

      logout: () => {
        localStorage.removeItem('grocify_token')
        set({ user: null, token: null })
      },

      setUser: (user) => set({ user }),
    }),
    { name: 'grocify-auth', partialize: s => ({ user: s.user, token: s.token }) }
  )
)

// ── UI STORE ───────────────────────────────────────────────────────────────
export const useUIStore = create(set => ({
  cartOpen:   false,
  searchOpen: false,
  mobileMenuOpen: false,
  openCart:   () => set({ cartOpen: true }),
  closeCart:  () => set({ cartOpen: false }),
  toggleCart: () => set(s => ({ cartOpen: !s.cartOpen })),
  openSearch: () => set({ searchOpen: true }),
  closeSearch:() => set({ searchOpen: false }),
  toggleMobileMenu: () => set(s => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu:  () => set({ mobileMenuOpen: false }),
}))
