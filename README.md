# 🥦 Grocify — Full-Stack Grocery E-Commerce

A complete MERN + React + Tailwind CSS grocery shopping platform with customer-facing website and REST API.

---

## 🏗 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS v3   |
| State     | Zustand (cart + auth)               |
| Routing   | React Router v6                     |
| HTTP      | Axios                               |
| UI        | react-icons, react-hot-toast, Headless UI |
| Backend   | Node.js + Express.js                |
| Database  | MongoDB + Mongoose                  |
| Auth      | JWT (jsonwebtoken) + bcryptjs       |
| Dev       | Nodemon + Concurrently              |

---

## 📁 Project Structure

```
grocify/
├── package.json              # Root (concurrently dev)
├── server/
│   ├── server.js             # Express entry point
│   ├── seeder.js             # DB seed script
│   ├── .env                  # Environment variables
│   ├── config/db.js          # MongoDB connection
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   └── Order.js
│   ├── controllers/          # Business logic
│   │   ├── productController.js
│   │   ├── userController.js
│   │   └── orderController.js
│   ├── routes/               # Express routers
│   │   ├── productRoutes.js
│   │   ├── userRoutes.js
│   │   ├── orderRoutes.js
│   │   └── categoryRoutes.js
│   └── middleware/
│       ├── auth.js           # JWT protect + admin
│       └── errorMiddleware.js
└── client/
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── services/api.js   # Axios service layer
        ├── context/store.js  # Zustand stores
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── CartDrawer.jsx
        │   ├── SearchOverlay.jsx
        │   ├── ProductCard.jsx
        │   ├── ProtectedRoute.jsx
        │   └── ScrollToTop.jsx
        └── pages/
            ├── HomePage.jsx
            ├── ShopPage.jsx
            ├── ProductPage.jsx
            ├── CheckoutPage.jsx
            ├── OrderSuccess.jsx
            ├── OrdersPage.jsx
            ├── OrderDetailPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── ProfilePage.jsx
            └── NotFoundPage.jsx
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone <repo-url>
cd grocify

# Install root dependencies
npm install

# Install server & client dependencies
npm run install-all
```

### 2. Configure Environment

Edit `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/grocify
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
```

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- ✅ 8 categories (Vegetables, Fruits, Dairy, etc.)
- ✅ 12 sample products with prices, stock, badges
- ✅ Admin user: `admin@grocify.in` / `admin123`

### 4. Start Development Servers

```bash
npm run dev
```

This starts both:
- 🟢 **Backend:** http://localhost:5000
- 🔵 **Frontend:** http://localhost:5173

---

## 🔌 API Endpoints

### Products
```
GET    /api/products              # List with filters & pagination
GET    /api/products/:id          # Single product by slug or ID
POST   /api/products              # Create (Admin)
PUT    /api/products/:id          # Update (Admin)
DELETE /api/products/:id          # Delete (Admin)
POST   /api/products/:id/reviews  # Add review (Auth)
```

**Query params:** `search`, `category`, `badge`, `featured`, `sort`, `minPrice`, `maxPrice`, `page`, `limit`

### Categories
```
GET    /api/categories     # All categories
POST   /api/categories     # Create (Admin)
PUT    /api/categories/:id # Update (Admin)
DELETE /api/categories/:id # Delete (Admin)
```

### Auth / Users
```
POST   /api/users/register  # Register
POST   /api/users/login     # Login → returns JWT
GET    /api/users/profile   # Get profile (Auth)
PUT    /api/users/profile   # Update profile (Auth)
POST   /api/users/address   # Add address (Auth)
GET    /api/users           # All users (Admin)
```

### Orders
```
POST   /api/orders          # Create order (Auth)
GET    /api/orders/my       # My orders (Auth)
GET    /api/orders/:id      # Order detail (Auth)
PUT    /api/orders/:id/pay  # Mark paid (Auth)
PUT    /api/orders/:id/status # Update status (Admin)
GET    /api/orders          # All orders (Admin)
```

---

## 🎨 Frontend Pages

| Route                | Page                    |
|----------------------|-------------------------|
| `/`                  | Home with Hero, Categories, Products, Deals |
| `/shop`              | Shop with filters, sort, pagination |
| `/shop/:category`    | Filtered by category slug |
| `/product/:slug`     | Product detail + reviews |
| `/checkout`          | Address + slot + payment |
| `/order-success/:id` | Order confirmation + tracking |
| `/orders`            | Order history |
| `/orders/:id`        | Order detail + live tracking |
| `/login`             | Login form |
| `/register`          | Registration form |
| `/profile`           | Profile edit + addresses |

---

## 🔐 Auth Flow

1. User registers → bcrypt hashes password → JWT returned
2. JWT stored in `localStorage` and Zustand persist
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. Backend `protect` middleware verifies JWT on protected routes
5. `admin` middleware checks `user.role === 'admin'`

---

## 🛒 Cart System (Zustand + LocalStorage)

- Cart persisted to localStorage via `zustand/middleware persist`
- `addItem`, `removeItem`, `updateQty`, `clearCart`
- Computed: `cartCount`, `cartTotal`, `deliveryFee`, `grandTotal`
- Free delivery auto-applied above ₹500

---

## 🌿 Demo Coupons

| Code     | Discount             |
|----------|----------------------|
| FIRST50  | ₹50 flat off         |
| WKND20   | 20% off order total  |
| SAVE100  | ₹100 flat off        |

---

## 🚀 Production Build

```bash
cd client && npm run build
```

Serve `client/dist` as static files from Express:

```js
// In server.js (production):
const path = require('path')
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../client/dist/index.html'))
  )
}
```

---

Built with ❤️ — Grocify, Fresh Groceries Delivered Fast 🚚
