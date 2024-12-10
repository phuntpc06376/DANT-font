import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faChartPie, faClipboard, faUsers, faFolder, faTags, faSignOutAlt, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import '../admin/Navbar.css'; // Import CSS tùy chỉnh

const Navbar = () => {
    const [logoutMessage, setLogoutMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false); // State để thu gọn/mở rộng menu
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setLogoutMessage('Đăng xuất thành công!');
        navigate('/login');
        setTimeout(() => setLogoutMessage(''), 3000);
    };

    const toggleNavbar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Hàm điều hướng về trang người dùng
    const goToUserPage = () => {
        navigate('/user'); // Điều hướng đến trang người dùng
    };

    return (
        <div className={`navbar-container1 ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="navbar-header1 d-flex align-items-center justify-content-between">
                <span>Seller</span>
                <div className="d-flex">
                    <button className="btn btn-sm btn-outline-secondary" onClick={toggleNavbar}>
                        <FontAwesomeIcon icon={isCollapsed ? faBars : faTimes} />
                    </button>
                    {/* Nút trở về trang User */}
                    <button className="btn btn-sm btn-outline-secondary ms-2" onClick={goToUserPage}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Home
                    </button>
                </div>
            </div>
            <ul className="nav flex-column mb-auto">
                <li className="nav-item">
                    <NavLink className="navbar-link1" to="products" activeClassName="active">
                        <FontAwesomeIcon icon={faClipboard} className="me-2" />
                        {!isCollapsed && 'Sản phẩm'}
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="navbar-link1" to="promotions" activeClassName="active">
                        <FontAwesomeIcon icon={faTags} className="me-2" />
                        {!isCollapsed && 'Khuyến mãi'}
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="navbar-link1" to="bill" activeClassName="active">
                        <FontAwesomeIcon icon={faFolder} className="me-2" />
                        {!isCollapsed && 'Hóa đơn'}
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="navbar-link1" to="feedback" activeClassName="active">
                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                        {!isCollapsed && 'Đánh giá sản phẩm'}
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="navbar-link1" to="staticalseller" activeClassName="active">
                        <FontAwesomeIcon icon={faChartPie} className="me-2" />
                        {!isCollapsed && 'Thống kê'}
                    </NavLink>
                </li>
            </ul>

            {logoutMessage && (
                <div className="alert alert-success mt-3" role="alert">
                    {logoutMessage}
                </div>
            )}

            <div className="navbar-footer1">
                {isLoggedIn && (
                    <button className="btn btn-outline-primary w-100" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                        {!isCollapsed && 'Đăng xuất'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Navbar;
