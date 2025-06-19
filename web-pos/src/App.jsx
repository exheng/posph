// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import{Button} from"antd";
// import{DeleteFilled} from"@ant-design/icons";
import{BrowserRouter,Routes,Route,Navigate} from"react-router-dom";
import './App.css'
import HomePage from "./page/home/HomePage";
import LogingPage from "./page/auth/LogingPage";
import RegisterPage from "./page/auth/RegisterPage";
import MainLayout from "./component/layout/MainLayout";
import CategoryPage from "./page/category/CategoryPage";
import CostomerPage from "./page/customer/CostomerPage";
import EmployeePage from "./page/empolyee/EmployeePage";
import PurchasePage from "./page/purchase/PurchasePage";
import MainLayoutAuth from "./component/layout/MainLayoutAuth";
import UserPage from "./page/user/UserPage";
import RolePage from "./page/role/RolePage";
import SupplierPage from "./page/purchase/SupplierPage";
import ProductPage from "./page/product/productPage";
import StockAlertPage from "./page/product/StockAlertPage";
import PurchaseOrderPage from "./page/purchase/PurchaseOrderPage";
import PosPage from "./page/pos/PosPage";
import PaymentPage from './page/pos/PaymentPage';
import CustomerSelectionPage from './page/pos/CustomerSelectionPage';
import ReceiptPage from './page/pos/ReceiptPage';
import OrderListPage from './page/order/OrderListPage';
import SalesReportPage from './page/report/SalesReportPage';
import InventoryReportPage from './page/report/InventoryReportPage';
import PerformanceReportPage from './page/report/PerformanceReportPage';
import PerformancePage from "./page/report/PerformancePage";
import PurchaseOrderReportPage from "./page/report/PurchaseOrderReportPage";
import DashboardPage from "./page/dashboard/DashboardPage";
import GeneralSettingPage from "./page/setting/GeneralSettingPage";
import SettingPage from "./page/setting/SettingPage";
// import BrandPage from "./page/brand/BrandPage";
import { getProfile } from './store/profile.store';

// Define role-based access permissions
const ROLE_PERMISSIONS = {
  cashier: [
    '/home',                // Home
    '/pos',                 // Point of Sale
    '/pos/payment',         // Payment
    '/pos/customer-selection', // Customer Selection
    '/pos/receipt',         // Receipt
    '/customer',            // Customers
    '/order',               // Orders
    '/product',             // Products (view only)
    '/stock-alerts',        // Stock Alerts
  ],
  admin: [
    '/',                    // Dashboard
    '/home',                // Home
    '/employee',            // Employee Management
    '/customer',            // Customers
    '/category',            // Categories
    '/product',             // Products
    '/stock-alerts',        // Stock Alerts
    '/purchase',            // Purchase Orders
    '/user',                // User Management
    '/role',                // Role Management
    '/supplier',            // Suppliers
    '/pos',                 // Point of Sale
    '/pos/payment',         // Payment
    '/pos/customer-selection', // Customer Selection
    '/pos/receipt',         // Receipt
    '/order',               // Orders
    '/sales-report',        // Sales Reports
    '/inventory-report',    // Inventory Reports
    '/performance',         // Performance
    '/performance-report',  // Performance Report
    '/purchase-order-report', // Purchase Order Reports
    '/general',             // General Settings
    '/notification',        // Notifications
  ],
  manager: [
    '/',                    // Dashboard
    '/home',                // Home
    '/customer',            // Customers
    '/category',            // Categories
    '/product',             // Products
    '/stock-alerts',        // Stock Alerts
    '/purchase',            // Purchase Orders
    '/supplier',            // Suppliers
    '/pos',                 // Point of Sale
    '/pos/payment',         // Payment
    '/pos/customer-selection', // Customer Selection
    '/pos/receipt',         // Receipt
    '/order',               // Orders
    '/sales-report',        // Sales Reports
    '/inventory-report',    // Inventory Reports
    '/performance',         // Performance
    '/performance-report',  // Performance Report
    '/purchase-order-report', // Purchase Order Reports
    '/general',             // General Settings
    '/notification',        // Notifications
  ]
};

// Route guard component
const RouteGuard = ({ children, allowedRoles = [] }) => {
  const profile = getProfile();
  const location = window.location.pathname;

  // Allow login and register pages without profile
  if (!profile && !['/login', '/register'].includes(location)) {
    return <Navigate to="/login" replace />;
  }

  // If user has a profile, check role-based permissions
  if (profile) {
    const userRole = profile.role_name?.toLowerCase();
    const allowedPaths = ROLE_PERMISSIONS[userRole] || [];

    // Check if the current path is allowed for the user's role
    if (!allowedPaths.includes(location)) {
      // Redirect to first allowed path or POS for cashiers
      const redirectPath = userRole === 'cashier' ? '/pos' : '/';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route element={<MainLayoutAuth/>} >
        <Route path="/login" element={<LogingPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="*" element={<h1>Route Not Found!!</h1>}/>
      </Route>
      <Route element={<MainLayout/>} >
        <Route path="/" element={<RouteGuard><DashboardPage/></RouteGuard>}/>
        <Route path="/home" element={<RouteGuard><HomePage/></RouteGuard>}/>
        <Route path="/employee" element={<RouteGuard allowedRoles={['admin']}><EmployeePage/></RouteGuard>}/>
        <Route path="/customer" element={<RouteGuard><CostomerPage/></RouteGuard>}/>
        <Route path="/category" element={<RouteGuard allowedRoles={['admin', 'manager']}><CategoryPage/></RouteGuard>}/>
        <Route path="/product" element={<RouteGuard><ProductPage/></RouteGuard>}/>
        <Route path="/stock-alerts" element={<RouteGuard><StockAlertPage/></RouteGuard>}/>
        <Route path="/purchase" element={<RouteGuard allowedRoles={['admin', 'manager']}><PurchaseOrderPage/></RouteGuard>}/>
        <Route path="/user" element={<RouteGuard allowedRoles={['admin']}><UserPage/></RouteGuard>}/>
        <Route path="/role" element={<RouteGuard allowedRoles={['admin']}><RolePage/></RouteGuard>}/>
        <Route path="/supplier" element={<RouteGuard allowedRoles={['admin', 'manager']}><SupplierPage/></RouteGuard>}/>
        <Route path="/pos" element={<RouteGuard><PosPage/></RouteGuard>}/>
        <Route path="/Product/Category1" element={<RouteGuard allowedRoles={['admin', 'manager']}><PurchasePage/></RouteGuard>}/>
        <Route path="/pos/payment" element={<RouteGuard><PaymentPage/></RouteGuard>} />
        <Route path="/pos/customer-selection" element={<RouteGuard><CustomerSelectionPage /></RouteGuard>} />
        <Route path="/pos/receipt" element={<RouteGuard><ReceiptPage /></RouteGuard>} />
        <Route path="/order" element={<RouteGuard><OrderListPage /></RouteGuard>} />
        <Route path="/sales-report" element={<RouteGuard><SalesReportPage /></RouteGuard>} />
        <Route path="/inventory-report" element={<RouteGuard><InventoryReportPage /></RouteGuard>} />
        <Route path="/performance" element={<RouteGuard><PerformancePage/></RouteGuard>}/>
        <Route path="/performance-report" element={<RouteGuard><PerformanceReportPage/></RouteGuard>}/>
        <Route path="/purchase-order-report" element={<RouteGuard allowedRoles={['admin', 'manager']}><PurchaseOrderReportPage/></RouteGuard>}/>
        <Route path="/general" element={<RouteGuard allowedRoles={['admin', 'manager']}><GeneralSettingPage/></RouteGuard>}/>
        <Route path="/notification" element={<RouteGuard allowedRoles={['admin', 'manager']}><SettingPage/></RouteGuard>}/>
        <Route path="*" element={<h1>Route Not Found!!</h1>}/>
      </Route>
    </Routes>
    </BrowserRouter>
   
  );
}

export default App
