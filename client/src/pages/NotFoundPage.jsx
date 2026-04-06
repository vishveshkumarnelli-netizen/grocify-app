import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="text-8xl mb-6">🥦</div>
      <h1 className="font-display text-6xl font-black text-forest-600 mb-2">404</h1>
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-3">Page Not Found</h2>
      <p className="text-gray-500 text-base max-w-sm mb-8 leading-relaxed">
        Looks like this page went out of stock! Let's get you back to the fresh produce.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link to="/" className="btn-primary px-8 py-3 rounded-xl">🏠 Go Home</Link>
        <Link to="/shop" className="btn-outline px-8 py-3 rounded-xl">🛒 Browse Shop</Link>
      </div>
    </div>
  )
}
