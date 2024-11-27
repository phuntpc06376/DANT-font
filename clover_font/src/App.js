import logo from './logo.svg';
import './App.css';
import Index from './components/pages/client/index'; // Chỉnh sửa chữ cái đầu thành chữ hoa
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import FacebookNavbar from './components/navbar/client/navbar';
import Profile from './components/pages/client/Profile/profile';
import ProductGallery from './components/pages/client/ProductGallery/ProductGallery';
import Cart from './components/pages/client/Cart/cart';
import ProductDetail from './components/pages/client/ProductDetail/productDetail';

import 'bootstrap/dist/css/bootstrap.min.css';
// Giả định UserLayout đã được định nghĩa, nếu không hãy import hoặc định nghĩa nó
// import UserLayout from './components/layouts/UserLayout'; 

function App() {
  return (
    <Router>
      <div>
        <FacebookNavbar /> {/* Move the Navbar outside of <Routes> */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/index" />} />
            <Route path="/index" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ProductGallery" element={<ProductGallery />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart  />} />

            {/* other routes */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;

