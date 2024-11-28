import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
    return (
        <div className="bg-light" style={{ position: 'fixed', height: '100%', width: '250px', overflowY: 'auto', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
            <div className="d-flex align-items-center justify-content-center py-4">
                <span className="fs-4 text-primary fw-bold">ADMIN</span>
            </div>
            <hr />
            <ul className="nav flex-column mb-auto">
            <li className="nav-item">
                    <Link className="nav-link" to="stactial-management">
                        <span className="fs-5 text-primary fw-bold">Thống kê</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link active" to="post-management">
                        <span className="fs-5 text-primary fw-bold">Quản lý bài đăng</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="account-management">
                        <span className="fs-5 text-primary fw-bold">Quản lý người dùng</span>
                    </Link>
                </li>
                {/* <li className="nav-item">
                    <Link className="nav-link" to="supplier-management">
                        <span className="fs-5 text-primary fw-bold">Quản lý nhà cung cấp</span>
                    </Link>
                </li> */}
                <li className="nav-item">
                    <Link className="nav-link active" to="type-product-management">
                        <span className="fs-5 text-primary fw-bold">Quản lý danh mục</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link active" to="property-management">
                        <span className="fs-5 text-primary fw-bold">Quản lý thuộc tính</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link active" to="properties-values-management">
                        <span className="fs-5 text-primary fw-bold">Quản lý thuộc tính con</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link active" to="register-seller-management">
                        <span className="fs-5 text-primary fw-bold">Quản lý đăng ký người bán</span>
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
};

export default Navbar;