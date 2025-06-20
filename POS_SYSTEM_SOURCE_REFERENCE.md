# POS System Source Code Reference

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend API (Node.js/Express)](#backend-api)
4. [Frontend (React/Vite)](#frontend)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Key Features](#key-features)
8. [Configuration](#configuration)
9. [File Structure](#file-structure)
10. [API Endpoints](#api-endpoints)
11. [State Management](#state-management)
12. [Telegram Integration](#telegram-integration)
13. [Development Setup](#development-setup)

## Project Overview

This is a comprehensive Point of Sale (POS) system built with:
- **Backend**: Node.js, Express.js, MySQL
- **Frontend**: React 18, Vite, Ant Design
- **State Management**: Zustand
- **Authentication**: JWT
- **Additional Features**: Telegram bot integration, PDF generation, Excel export

### Core Features
- User authentication and role-based access control
- Product management with barcode support
- Inventory management with stock alerts
- Sales processing and order management
- Customer management
- Supplier and purchase order management
- Reporting and analytics
- Receipt generation
- Telegram notifications

## Architecture

### Backend Architecture
```
api-pos/
├── src/
│   ├── controller/     # Business logic
│   ├── route/         # API routes
│   ├── middleware/    # Custom middleware
│   └── util/          # Utilities and helpers
├── logs/              # Error logs
├── pos_img/           # Image uploads
├── receipts/          # Generated PDFs
└── index.js           # Server entry point
```

### Frontend Architecture
```
web-pos/
├── src/
│   ├── component/     # Reusable components
│   ├── page/          # Page components
│   ├── store/         # Zustand stores
│   ├── context/       # React contexts
│   ├── util/          # Utilities
│   └── assets/        # Static assets
└── public/            # Public assets
```

## Backend API

### Server Configuration
```javascript
// api-pos/index.js
const express = require("express");
const cors = require("cors");
const app = express();
const port = 8081;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/pos_img', express.static(config.img_path));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/product', productRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/config', configRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/brand', brandRoutes);
```

### Database Connection
```javascript
// api-pos/src/util/connection.js
const mysql = require("mysql2/promise");
const { config } = require("./config");

module.exports = mysql.createPool({
  host: config.db.HOST,
  user: config.db.USER,
  password: config.db.PASSWORD,
  database: config.db.DATABASE,
  port: config.db.PORT,
  namedPlaceholders: true,
});
```

### Configuration
```javascript
// api-pos/src/util/config.js
module.exports = {
  config: {
    app_name: "POS PH",
    app_version: "1.0",
    img_path: path.join("C:/xampp/htdocs/pos_img"),
    
    db: {
      HOST: "localhost",
      USER: "root",
      PASSWORD: "",
      DATABASE: "pos",
      PORT: 3306,
    },
    
    token: {
      access_token_key: "your-secret-key"
    },
    
    telegram: {
      bot_token: process.env.TELEGRAM_BOT_TOKEN,
      chat_id: process.env.TELEGRAM_CHAT_ID
    }
  },
};
```

## Frontend

### Main App Structure
```javascript
// web-pos/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<MainLayoutAuth/>}>
          <Route path="/login" element={<LogingPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
        </Route>
        
        {/* Protected Routes */}
        <Route element={<MainLayout/>}>
          <Route path="/" element={<DashboardPage/>}/>
          <Route path="/home" element={<HomePage/>}/>
          <Route path="/employee" element={<EmployeePage/>}/>
          <Route path="/customer" element={<CostomerPage/>}/>
          <Route path="/category" element={<CategoryPage/>}/>
          <Route path="/product" element={<ProductPage/>}/>
          <Route path="/stock-alerts" element={<StockAlertPage/>}/>
          <Route path="/purchase" element={<PurchaseOrderPage/>}/>
          <Route path="/user" element={<UserPage/>}/>
          <Route path="/role" element={<RolePage/>}/>
          <Route path="/supplier" element={<SupplierPage/>}/>
          <Route path="/pos" element={<PosPage/>}/>
          <Route path="/pos/payment" element={<PaymentPage/>} />
          <Route path="/pos/customer-selection" element={<CustomerSelectionPage />} />
          <Route path="/pos/receipt" element={<ReceiptPage />} />
          <Route path="/order" element={<OrderListPage />} />
          <Route path="/sales-report" element={<SalesReportPage />} />
          <Route path="/inventory-report" element={<InventoryReportPage />} />
          <Route path="/performance" element={<PerformancePage/>}/>
          <Route path="/performance-report" element={<PerformanceReportPage/>}/>
          <Route path="/purchase-order-report" element={<PurchaseOrderReportPage/>}/>
          <Route path="/general" element={<GeneralSettingPage/>}/>
          <Route path="/notification" element={<SettingPage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Route Guard Implementation
```javascript
const RouteGuard = ({ children, allowedRoles = [] }) => {
  const profile = getProfile();
  const location = window.location.pathname;

  // Allow login and register pages without profile
  if (!profile && !['/login', '/register'].includes(location)) {
    return <Navigate to="/login" replace />;
  }

  // If role is cashier and trying to access dashboard, redirect to POS
  if (profile && profile.role_name?.toLowerCase() === 'cashier' && location === '/') {
    return <Navigate to="/pos" replace />;
  }

  // If specific roles are required and user's role is not allowed
  if (profile && allowedRoles.length > 0 && !allowedRoles.includes(profile.role_name?.toLowerCase())) {
    return <Navigate to="/pos" replace />;
  }

  return children;
};
```

### Authentication Context
```javascript
// web-pos/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAccessToken, setAccessToken, setProfile, getProfile } from '../store/profile.store';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setInternalToken] = useState(getAccessToken());
  const [user, setUser] = useState(getProfile());

  const setAuthToken = (newToken) => {
    setAccessToken(newToken);
    setInternalToken(newToken);
  };

  const setAuthUser = (newUser) => {
    setProfile(newUser);
    setUser(newUser);
  };

  const logout = () => {
    setAccessToken(null);
    setProfile(null);
    setInternalToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ 
      token, 
      setToken: setAuthToken, 
      user, 
      setUser: setAuthUser, 
      isAuthenticated, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### API Helper
```javascript
// web-pos/src/util/helper.js
import axios from "axios";
import { Config } from "./config";
import { setServerSatus } from "../store/server.store";
import { getAccessToken } from "../store/profile.store";

export const request = async (url = "", method = "get", data = {}) => {
  var access_token = getAccessToken();
  var headers = { "Content-Type": "application/json" };
  
  if (data instanceof FormData) {
    headers = { "Content-Type": "multipart/form-data" }
  }
  
  return axios({
    url: Config.base_url + url,
    method: method,
    data: data,
    headers: {
      ...headers,
      Authorization: `Bearer ${access_token}`,
    },
  })
    .then((res) => {
      setServerSatus(200);
      return res.data;
    })
    .catch((err) => {
      var response = err.response;
      if (response) {
        var status = response.status;
        if (status == "401") {
          status = 403;
        }
        setServerSatus(status);
        console.error(`API Error: Status ${status}, URL: ${err.config.url}, Method: ${err.config.method}`, response.data);
        return { error: true, details: response.data };
      } else if (err.code == "ERR_NETWORK") {
        setServerSatus("error");
        console.error(`Network Error: URL: ${err.config.url}, Method: ${err.config.method}`, err.message);
        return { error: true, details: err.message };
      }
      return { error: true, details: "An unknown error occurred" };
    });
};
```

## State Management

### Profile Store
```javascript
// web-pos/src/store/profile.store.js
export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
};

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

export const setProfile = (profile) => {
  if (profile !== null && profile !== undefined) {
    localStorage.setItem("profile", JSON.stringify(profile));
  } else {
    localStorage.removeItem("profile");
  }
};

export const getProfile = () => {
  try {
    const profile = localStorage.getItem("profile");
    if (profile && (profile.startsWith('{') || profile.startsWith('['))) {
      return JSON.parse(profile);
    }
    return null;
  } catch (error) {
    console.error("Error parsing profile from localStorage:", error);
    localStorage.removeItem("profile");
    return null;
  }
};
```

### Config Store
```javascript
// web-pos/src/store/configStore.js
import { create } from "zustand";
import { request } from "../util/helper";

export const configStore = create((set) => ({
  config: {
    store: {
      name: '',
      phone: '',
      address: '',
      email: '',
      website: '',
      currency: 'USD',
      tax_rate: 0,
      logo: '',
    },
    system: {
      language: 'en',
      timezone: 'UTC',
      date_format: 'YYYY-MM-DD',
      time_format: '24h',
    },
    appearance: {
      theme: 'light',
      primary_color: '#1890ff',
      secondary_color: '#52c41a',
    },
    category: null,
    role: null,
    supplier: null,
    purchase_status: null,
    brand: null,
  },
  
  setConfig: (params) => set((state) => ({
    config: { ...state.config, ...params },
  })),
  
  refreshConfig: async () => {
    try {
      const response = await request('config', 'get');
      if (response && !response.error) {
        set((state) => ({
          config: { ...state.config, ...response },
        }));
        const event = new Event('configUpdated');
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error refreshing config:', error);
    }
  },
}));
```

## Authentication & Authorization

### Login Controller
```javascript
// api-pos/src/controller/auth.controller.js
exports.login = async (req, res) => {
  try {
    let { password, username } = req.body;
    let sql = "SELECT u.*, r.name as role_name FROM user u INNER JOIN role r ON u.role_id = r.id WHERE u.username=:username";
    let [data] = await db.query(sql, { username: username });

    if (data.length === 0) {
      res.status(401).json({
        error: { username: "Username doesn't exist!" }
      });
    } else {
      let dbPass = data[0].password;
      let isCorrectPass = bcrypt.compareSync(password, dbPass);
      
      if (!isCorrectPass) {
        res.status(401).json({
          error: { password: "Password incorrect!" }
        });
      } else {
        delete data[0].password;
        
        // Define permissions based on role
        let permissions = [];
        if (data[0].role_name.toLowerCase() === 'cashier') {
          permissions = [
            'use_pos',
            'manage_customers',
            'view_orders',
            'view_inventory',
            'view_products',
            'view_stock_alerts'
          ];
        } else {
          permissions = [
            'view_all',
            'delete',
            'edit',
            'manage_users',
            'manage_roles',
            'manage_settings',
            'view_reports',
            'manage_purchases',
            'view_dashboard'
          ];
        }

        let obj = {
          profile: data[0],
          permissions: permissions
        }
        
        res.json({
          message: "Login success",
          ...obj,
          access_token: await getAccessToken(obj),
        });
      }
    }
  } catch (error) {
    await logError("auth.login", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};
```

### JWT Token Generation
```javascript
const getAccessToken = async (paramData) => {
  const access_token = await jwt.sign(
    { data: paramData }, 
    config.config.token.access_token_key, 
    { expiresIn: "1d" }
  );
  return access_token;
};
```

## Key Features

### Product Management
```javascript
// api-pos/src/controller/product.controller.js
exports.create = async (req, res) => {
  try {
    if (await isExistBarcode(req.body.barcode)) {
      res.json({
        error: { barcode: "Barcode is already exist!" }
      });
      return false;
    }
    
    const sql = "INSERT INTO product (category_id, barcode, name, brand, description, qty, price, discount, status, create_by, image) VALUES (:category_id, :barcode, :name, :brand, :description, :qty, :price, :discount, :status, :create_by, :image)";

    const [data] = await db.query(sql, {
      ...req.body,
      image: req.file?.filename,
      create_by: req.auth?.name,
    });

    res.json({
      data,
      message: "Insert Success!",
    });
  } catch (error) {
    await logError("product.create", error);
    res.status(500).json({ error: "Failed to create product", details: error.message });
  }
};
```

### Order Processing
```javascript
// api-pos/src/controller/order.controller.js
exports.create = async (req, res) => {
  try {
    const { customer_id, items, total_amount, payment_method, payment_amount, change_amount, currency, exchange_rate_to_usd } = req.body;

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Generate order number
      const [orderNumberResult] = await connection.query(
        "SELECT CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD((SELECT COALESCE(MAX(id), 0) + 1 FROM orders), 4, '0')) as order_number"
      );
      const orderNumber = orderNumberResult[0].order_number;

      // Create order
      const [orderResult] = await connection.query(
        "INSERT INTO orders (order_number, customer_id, total_amount, payment_method, payment_amount, change_amount, status, create_by, currency, exchange_rate_to_usd, discount) VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?)",
        [orderNumber, customer_id, total_amount, payment_method, payment_amount, change_amount, req.auth?.name, currency, exchange_rate_to_usd, req.body.discount || 0]
      );

      const orderId = orderResult.insertId;

      // Insert order items and update product quantities
      for (const item of items) {
        await connection.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price, discount) VALUES (?, ?, ?, ?, ?)",
          [orderId, item.product_id, item.quantity, item.price, item.discount || 0]
        );

        await connection.query(
          "UPDATE product SET qty = qty - ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      
      // Send Telegram notification and generate receipt
      // ... (implementation details)
      
      res.json({
        message: "Order created successfully",
        data: { order_number: orderNumber, order: { ...order[0], items: orderItems } }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    await logError("order.create", error);
    res.status(500).json({ error: "Failed to create order", details: error.message });
  }
};
```

## Telegram Integration

### Telegram Bot Setup
```javascript
// api-pos/setup-telegram-bot.js
const TelegramBot = require('node-telegram-bot-api');
const config = require('./src/util/config');

const bot = new TelegramBot(config.config.telegram.bot_token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;
  
  if (message === '/start') {
    bot.sendMessage(chatId, 'Welcome to POS System Bot! You will receive notifications here.');
  }
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});
```

### Send Telegram Message
```javascript
// api-pos/src/util/telegram.js
const axios = require('axios');
const config = require('./config');

exports.sendTelegramMessage = async (message) => {
  try {
    const url = `https://api.telegram.org/bot${config.config.telegram.bot_token}/sendMessage`;
    const data = {
      chat_id: config.config.telegram.chat_id,
      text: message,
      parse_mode: 'HTML'
    };
    
    await axios.post(url, data);
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
};
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/getList` - Get users list
- `DELETE /api/auth/remove/:id` - Delete user
- `POST /api/auth/uploadProfilePic` - Upload profile picture

### Products
- `GET /api/product/getList` - Get products list
- `POST /api/product/create` - Create product
- `PUT /api/product/update` - Update product
- `DELETE /api/product/remove` - Delete product
- `GET /api/product/newBarcode` - Generate new barcode

### Orders
- `GET /api/order/getList` - Get orders list
- `POST /api/order/create` - Create order
- `GET /api/order/reports` - Get order reports

### Categories
- `GET /api/category/getList` - Get categories list
- `POST /api/category/create` - Create category
- `PUT /api/category/update` - Update category
- `DELETE /api/category/remove` - Delete category

### Customers
- `GET /api/customer/getList` - Get customers list
- `POST /api/customer/create` - Create customer
- `PUT /api/customer/update` - Update customer
- `DELETE /api/customer/remove` - Delete customer

### Suppliers
- `GET /api/supplier/getList` - Get suppliers list
- `POST /api/supplier/create` - Create supplier
- `PUT /api/supplier/update` - Update supplier
- `DELETE /api/supplier/remove` - Delete supplier

### Configuration
- `GET /api/config/getList` - Get configuration
- `PUT /api/config/update` - Update configuration

## Database Schema

### Core Tables
- `user` - User accounts and authentication
- `role` - User roles and permissions
- `product` - Product catalog
- `category` - Product categories
- `brand` - Product brands
- `customer` - Customer information
- `supplier` - Supplier information
- `orders` - Sales orders
- `order_items` - Order line items
- `purchase` - Purchase orders
- `purchase_items` - Purchase line items

## Development Setup

### Backend Setup
```bash
cd api-pos
npm install
npm run dev
```

### Frontend Setup
```bash
cd web-pos
npm install
npm run dev
```

### Environment Variables
```bash
# Backend (.env)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pos
DB_PORT=3306
```

### Dependencies

#### Backend Dependencies
- express: Web framework
- mysql2: MySQL database driver
- bcrypt: Password hashing
- jsonwebtoken: JWT authentication
- multer: File upload handling
- cors: Cross-origin resource sharing
- dayjs: Date manipulation
- pdfkit: PDF generation
- exceljs: Excel file handling
- node-telegram-bot-api: Telegram bot integration

#### Frontend Dependencies
- react: UI library
- react-dom: React DOM rendering
- react-router-dom: Client-side routing
- antd: UI component library
- @ant-design/icons: Icon library
- @ant-design/plots: Chart components
- zustand: State management
- axios: HTTP client
- dayjs: Date manipulation
- react-to-print: Print functionality

## File Structure

### Backend Structure
```
api-pos/
├── src/
│   ├── controller/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── category.controller.js
│   │   ├── customer.controller.js
│   │   ├── supplier.controller.js
│   │   ├── purchase.controller.js
│   │   ├── config.controller.js
│   │   ├── role.controller.js
│   │   └── brand.controller.js
│   ├── route/
│   │   ├── auth.route.js
│   │   ├── product.route.js
│   │   ├── order.route.js
│   │   ├── category.route.js
│   │   ├── customer.route.js
│   │   ├── supplier.route.js
│   │   ├── purchase.route.js
│   │   ├── config.route.js
│   │   ├── role.route.js
│   │   ├── brand.route.js
│   │   └── telegram.route.js
│   ├── middleware/
│   │   └── validate_token.js
│   └── util/
│       ├── config.js
│       ├── connection.js
│       ├── helper.js
│       ├── logError.js
│       └── telegram.js
├── logs/
├── pos_img/
├── receipts/
├── index.js
├── bot-polling.js
├── setup-telegram-bot.js
└── package.json
```

### Frontend Structure
```
web-pos/
├── src/
│   ├── component/
│   │   ├── home/
│   │   │   ├── HomeGrid.jsx
│   │   │   ├── HomePurchaseChart.jsx
│   │   │   └── HomeSaleChart.jsx
│   │   └── layout/
│   │       ├── MainLayout.jsx
│   │       ├── MainLayoutAuth.jsx
│   │       ├── MainPage.jsx
│   │       ├── MessagePanel.jsx
│   │       └── NotificationPanel.jsx
│   ├── page/
│   │   ├── auth/
│   │   │   ├── LogingPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── category/
│   │   │   └── CategoryPage.jsx
│   │   ├── customer/
│   │   │   └── CostomerPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── empolyee/
│   │   │   └── EmployeePage.jsx
│   │   ├── home/
│   │   │   └── HomePage.jsx
│   │   ├── order/
│   │   │   └── OrderListPage.jsx
│   │   ├── pos/
│   │   │   ├── CustomerSelectionPage.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   ├── PosPage.jsx
│   │   │   └── ReceiptPage.jsx
│   │   ├── product/
│   │   │   ├── ProductPage.jsx
│   │   │   └── StockAlertPage.jsx
│   │   ├── purchase/
│   │   │   ├── PurchaseOrderPage.jsx
│   │   │   ├── PurchasePage.jsx
│   │   │   └── SupplierPage.jsx
│   │   ├── report/
│   │   │   ├── InventoryReportPage.jsx
│   │   │   ├── PerformancePage.jsx
│   │   │   ├── PerformanceReportPage.jsx
│   │   │   ├── PurchaseOrderReportPage.jsx
│   │   │   └── SalesReportPage.jsx
│   │   ├── role/
│   │   │   └── RolePage.jsx
│   │   ├── setting/
│   │   │   ├── GeneralSettingPage.jsx
│   │   │   └── SettingPage.jsx
│   │   └── user/
│   │       └── UserPage.jsx
│   ├── store/
│   │   ├── configStore.js
│   │   ├── notification.store.js
│   │   ├── profile.store.js
│   │   └── server.store.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── util/
│   │   ├── config.js
│   │   └── helper.js
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

This reference document provides a comprehensive overview of your POS system's architecture, implementation details, and key components. Use it as a guide for understanding the codebase structure, API endpoints, and development patterns.
