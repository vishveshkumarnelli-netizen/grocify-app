import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAdminStore = create(
  persist(
    (set) => ({
      admin:  null,
      token:  null,
      login:  ({ user, token }) => {
        localStorage.setItem('grocify_admin_token', token)
        set({ admin: user, token })
      },
      logout: () => {
        localStorage.removeItem('grocify_admin_token')
        set({ admin: null, token: null })
      },
    }),
    { name: 'grocify-admin-auth' }
  )
)
