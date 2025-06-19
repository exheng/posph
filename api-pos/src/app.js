const express = require("express");
const cors = require("cors");
const app = express();

// Import routes
const authRoutes = require("./route/auth.route");
const categoryRoutes = require("./route/category.route");
const supplierRoutes = require("./route/supplier.route");
const productRoutes = require("./route/product.route");
const telegramRoutes = require("./route/telegram.route");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/product", productRoutes);
app.use("/api/telegram", telegramRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

module.exports = app; 