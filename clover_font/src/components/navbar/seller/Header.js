import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";


export default function Header({ onLogout, isLoggedIn }) {

    
  return (
    <div className="bg-light" style={{ position: 'fixed', height: '100%', width: '250px', overflowY: 'auto', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
        <div className="d-flex align-items-center justify-content-center py-4">
            <span className="fs-4 text-primary fw-bold">Seller</span>
        </div>
        <hr />
        <ul className="nav flex-column mb-auto">
        <li className="nav-item">
                <Link className="nav-link" to="products">
                    <span className="fs-5 text-primary fw-bold">Quản lý sản phẩm</span>
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to="promotions">
                    <span className="fs-5 text-primary fw-bold">Quản lý Khuyến mãi</span>
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to="supplier">
                    <span className="fs-5 text-primary fw-bold">Quản lý Nhà cung cấp</span>
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to="bill">
                    <span className="fs-5 text-primary fw-bold">Quản lý Hóa đơn</span>
                </Link>
            </li>
            
        </ul>
        {/* <div className="mt-auto p-3">
            <Link className="btn btn-outline-primary w-100" to="/logout">
                Đăng xuất
            </Link>
        </div> */}
    </div>
);
}
