import { Routes, Route } from 'react-router-dom'
import Navbar        from './components/Navbar'
import Footer        from './components/Footer'
import CartDrawer    from './components/CartDrawer'
import SearchOverlay from './components/SearchOverlay'
import ScrollToTop   from './components/ScrollToTop'

import HomePage       from './pages/HomePage'
import ShopPage       from './pages/ShopPage'
import ProductPage    from './pages/ProductPage'
import CheckoutPage   from './pages/CheckoutPage'
import OrderSuccess   from './pages/OrderSuccess'
import OrdersPage     from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import ProfilePage    from './pages/ProfilePage'
import NotFoundPage   from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <SearchOverlay />

      <main className="min-h-screen">
        <Routes>
          <Route path="/"                 element={<HomePage />} />
          <Route path="/shop"             element={<ShopPage />} />
          <Route path="/shop/:category"   element={<ShopPage />} />
          <Route path="/product/:slug"    element={<ProductPage />} />
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/register"         element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout"       element={<CheckoutPage />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            <Route path="/orders"         element={<OrdersPage />} />
            <Route path="/orders/:id"     element={<OrderDetailPage />} />
            <Route path="/profile"        element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  )
}
