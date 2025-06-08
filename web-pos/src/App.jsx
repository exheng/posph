// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import{Button} from"antd";
// import{DeleteFilled} from"@ant-design/icons";
import{BrowserRouter,Routes,Route} from"react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route element={<MainLayout/>} >
      <Route path="/" element={<HomePage/>}/>
      <Route path="/employee" element={<EmployeePage/>}/>
      <Route path="/costomer" element={<CostomerPage/>}/>
      <Route path="/category" element={<CategoryPage/>}/>
      <Route path="/product" element={<ProductPage/>}/>
      <Route path="/stock-alerts" element={<StockAlertPage/>}/>
      <Route path="/purchase" element={<PurchaseOrderPage/>}/>
      <Route path="/user" element={<UserPage/>}/>
      <Route path="/role" element={<RolePage/>}/>
      <Route path="/supplier" element={<SupplierPage/>}/>
      <Route path="/pos" element={<PosPage/>}/>
      <Route path="/Product/Category1" element={<PurchasePage/>}/>
      <Route path="/payment" element={<PaymentPage/>} />
      <Route path="/pos/customer-selection" element={<CustomerSelectionPage />} />
      <Route path="*" element={<h1>Route Not Found!!</h1>}/>
      </Route>

      <Route element={<MainLayoutAuth/>} >
      <Route path="/login" element={<LogingPage/>}/>
      <Route path="/register" element={<RegisterPage/>}/>
      <Route path="*" element={<h1>Route Not Found!!</h1>}/>
      </Route>
    </Routes>
    </BrowserRouter>
   
  );
}

export default App
