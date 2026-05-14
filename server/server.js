const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const colors = require("colors");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// ✅ Load env properly
dotenv.config({ path: path.resolve(__dirname, ".env") });

// ✅ Connect DB
connectDB();

const app = express();

// ✅ CORS (Frontend + Admin)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174","https://grocify-app-seven.vercel.app","https://grocify-app-q5yy.vercel.app"],
    credentials: true,
  })
);

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Root route
app.get("/", (req, res) => {
  res.json({ message: "🚀 Grocify Server Running" });
});

// ✅ API Routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes")); // 🔥 (important)

// ✅ Health Check (Improved)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "🥦 Grocify API running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ✅ Serve frontend (Production)
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../client/dist");

  app.use(express.static(clientPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(clientPath, "index.html"));
  });
}

// ✅ Error handlers (ALWAYS LAST)
app.use(notFound);
app.use(errorHandler);

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(
    `🚀 Grocify Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`
      .yellow.bold
  )
);





// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const colors = require('colors');
// const connectDB = require('./config/db');
// const { notFound, errorHandler } = require('./middleware/errorMiddleware');


// dotenv.config();
// connectDB();

// const app = express();

// // Middleware — allow customer app (5173) AND admin panel (5174)
// app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.get('/', (req, res) => {
//   res.json({ message: "Hello Server" });
// });
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/categories', require('./routes/categoryRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));
// app.use("/api/payment", require('./routes/paymentRoutes'));

// // Health check
// app.get('/api/health', (req, res) => res.json({ status: 'OK', message: '🥦 Grocify API running' }));

// // Error handlers
// app.use(notFound);
// app.use(errorHandler);

// // In server.js (production):
// const path = require('path')
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/dist')))
//   app.get('*', (req, res) =>
//     res.sendFile(path.resolve(__dirname, '../client/dist/index.html'))
//   )
// }

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () =>
//   console.log(`🚀 Grocify Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`.yellow.bold)
// );
