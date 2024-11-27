import './App.css';
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
// Layout và Navbar
import FacebookNavbar from './components/navbar/client/navbar';
import NavAdmin from './components/navbar/admin/Navbar';
import NavSeller from './components/navbar/seller/Header';

// Các trang của user
import Index from './components/pages/client/index';
import Profile from './components/pages/client/Profile/profile';
import ProductGallery from './components/pages/client/ProductGallery/ProductGallery';
import Cart from './components/pages/client/Cart/cart';
import ProductDetail from './components/pages/client/ProductDetail/productDetail';
import OrderSummary from './components/pages/client/OrderSummary/OrderSummary';
import Order from './components/pages/client/OderCilent/oder_client';
import UserProfile from './components/pages/client/UserProfile/UserProfile';
import ResultPayment from './components/pages/client/OderCilent/ResultPayment';



// Trang account
import Login from './components/pages/client/Login/Login';
import Register from './components/pages/client/Register/Register';
import Forgot from './components/pages/client/ForgotPassword/Forgot';
import CheckEmail from './components/pages/client/ForgotPassword/Checkmail';
import ResetPassword from './components/pages/client/ForgotPassword/ResetPassword';

// Các trang của admin
import AccountManagement from './components/pages/Admin/AccountManagement/AccountManagement';
import SupplierList from './components/pages/Admin/Supplier/Supplier';
import PostList from './components/pages/Admin/Post/Post';
import StaticalAd from './components/pages/Admin/StaticalAd/StaticalAd';
import PropertyManager from './components/pages/Admin/Property/Property';
import PropertyValueManager from './components/pages/Admin/PropertiesValues/PropertiesValue';
//các trang của seller
import Product from './components/pages/seller/Product/Product'
import Promotion from './components/pages/seller/Promotions/Promotions';
import Supplier from './components/pages/seller/Supplier/Supplier';
import Bill from './components/pages/seller/Bill/Bill';



//chat
import ChatApp from './components/pages/client/chat/chat';
// import ChatItem from './components/pages/client/chat/ChatItem';
// import WelcomeScreen from './components/pages/client/chat/welcomeScreen';
// import ChatScreen from './components/pages/client/chat/ChatScreen';

// Layout component cho user
function UserLayout() {
  return (
    <div>
      <FacebookNavbar />
      <div className="content">
        <Routes>
          <Route path="index" element={<Index />} />
          <Route path="profile" element={<Profile />} />
          <Route path="productGallery" element={<ProductGallery />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="order" element={<Order />} />
          <Route path="orderSummary" element={<OrderSummary />} />
          <Route path="chat" element={<ChatApp />} />
          <Route path="resultpayment" element={<ResultPayment />} />
          {/* <Route exact path="chat" component={ChatScreen} /> */}
          
          {/* <Route exact path="/chat" component={ChatScreen} />
          <Route path="/" component={WelcomeScreen} /> */}

          <Route path="*" element={<Navigate to="/user/index" />} />
        </Routes>
      </div>
    </div>
  );
}

// Layout component cho admin
function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false); // State để điều khiển navbar thu gọn

  return (
    <div className="admin-layout">
      <NavAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /> {/* Truyền trạng thái navbar vào */}
      <div className={`content-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div style={{ padding: '20px', marginLeft: isCollapsed ? '50px' : '80px', width: isCollapsed ? 'calc(100% - 50px)' : 'calc(100% - 80px)' }}>
          <Routes>
            <Route path="account-management" element={<AccountManagement />} />
            <Route path="supplier-management" element={<SupplierList />} />
            <Route path="post-management" element={<PostList />} />
            <Route path="stactial-management" element={<StaticalAd />} />
            <Route path="property-management" element={<PropertyManager />} />
            <Route path="properties-values-management" element={<PropertyValueManager />} />
            <Route path="*" element={<Navigate to="/admin/stactial-management" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

//layout component seller
function SellerLayout() {
  return (
    <div >
      <NavSeller />
      <div className="content">
      <div style={{ padding: '20px', marginLeft: '250px', width: 'calc(100% - 250px)' }}>
          <Routes>
            {/* Các route khác */}
            <Route path="products" element={<Product />} />
            <Route path="promotions" element={<Promotion />} />
            <Route path="*" element={<Navigate to="/seller/products" />} />
            <Route path="supplier" element={<Supplier />} />
            <Route path="bill" element={<Bill />} />
            {/* <Route path="/oders" element={<Oder />} />
            <Route path="/products" element={<Product />} />
           
            <Route path="/posts" element={<Posts />} />
            <Route path="/add-posts" element={<AddPosts />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/add-promotion" element={<AddPromotion />} />
            <Route path="/detailoder" element={<DetailOderr />} />
            <Route path="/notification" element={<Typenotification />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/add-suppliers" element={<AddSuppliers />} /> */}
          </Routes>
          </div>
        </div>
      </div>
    
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Route cho trang login */}
        <Route path="/login" element={<Login />} />

        {/* Route cho trang login */}
        <Route path="/register" element={<Register />} />

        {/* Route cho trang forgot password */}
        <Route path="/forgot-password" element={<Forgot />} />

        {/* Route cho trang check mail sau khi fogotpass */}
        <Route path="/check-email" element={<CheckEmail />} />

        {/* Route cho trang ResetPassword sau khi checkmail */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Điều hướng tới trang người dùng chính nếu không có đường dẫn */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Layout và route cho user */}
        <Route path="/user/*" element={<UserLayout />} />
        <Route path="profiles/:userName" element={<UserProfile />} />
        {/* Layout và route cho admin */}

        <Route path="/admin/*" element={<AdminLayout />} />

        {/* Layout và route cho seller */}

        <Route path="/seller/*" element={<SellerLayout />} />

        {/* Điều hướng tới trang user nếu không khớp route */}
        <Route path="*" element={<Navigate to="/user/index" />} />
      </Routes>
    </Router>
  );
}

export default App;
