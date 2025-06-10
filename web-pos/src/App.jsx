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
import Performance from './page/report/PerformancePage';
import PerformancePage from "./page/report/PerformancePage";
import DashboardPage from "./page/dashboard/DashboardPage";
import GeneralSettingPage from "./page/setting/GeneralSettingPage";
// import BrandPage from "./page/brand/BrandPage";
import { getProfile } from './store/profile.store';

// Route guard component
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
        <Route path="/Product/Category1" element={<PurchasePage/>}/>
        <Route path="/pos/payment" element={<PaymentPage/>} />
        <Route path="/pos/customer-selection" element={<CustomerSelectionPage />} />
        <Route path="/pos/receipt" element={<ReceiptPage />} />
        <Route path="/order" element={<OrderListPage />} />
        <Route path="/sales-report" element={<SalesReportPage />} />
        <Route path="/inventory-report" element={<InventoryReportPage />} />
        <Route path="/performance" element={<PerformancePage/>}/>
        <Route path="/general" element={<GeneralSettingPage/>}/>
        <Route path="*" element={<h1>Route Not Found!!</h1>}/>
      </Route>
    </Routes>
    </BrowserRouter>
   
  );
}

export default App
