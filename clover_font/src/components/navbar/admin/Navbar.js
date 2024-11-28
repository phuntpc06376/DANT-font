import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css'; // Import CSS tùy chỉnh
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faChartPie, faClipboard, faUsers, faFolder, faTags, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; // Import các icon cần dùng

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

    return (
        <div className={`navbar-container1 ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="navbar-header1 d-flex align-items-center justify-content-between">
                <span>ADMIN</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={toggleNavbar}>
                    <FontAwesomeIcon icon={isCollapsed ? faBars : faTimes} />
                </button>
            </div>
            <ul className="nav flex-column mb-auto">
                <li className="nav-item">
                    <NavLink
                        className="navbar-link1"
                        to="post-management"
                        activeClassName="active"
                    >
                        <FontAwesomeIcon icon={faClipboard} className="me-2" />
                        {!isCollapsed && 'Bài đăng'}
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className="navbar-link1"
                        to="account-management"
                        activeClassName="active"
                    >
                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                        {!isCollapsed && 'Người dùng'}
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className="navbar-link1"
                        to="property-management"
                        activeClassName="active"
                    >
                        <FontAwesomeIcon icon={faFolder} className="me-2" />
                        {!isCollapsed && 'Thuộc tính con'}
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className="navbar-link1"
                        to="properties-values-management"
                        activeClassName="active"
                    >
                        <FontAwesomeIcon icon={faTags} className="me-2" />
                        {!isCollapsed && 'Thuộc tính'}
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className="navbar-link1"
                        to="stactial-management"
                        activeClassName="active"
                    >
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
