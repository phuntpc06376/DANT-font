import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faSignsPost, faUsers, faFolder, faTags, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; // Import các icon cần dùng
import "./Navbar.css";
import {getAccountByUsername} from "./account"; // Import CSS tùy chỉnh
import { IoStorefrontSharp } from "react-icons/io5";

const Navbar = () => {
    const [logoutMessage, setLogoutMessage] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [fullname, setFullName] = useState("Loading..."); // State để lưu tên shop
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            setIsLoggedIn(true);

            // Gọi API lấy thông tin shop
            getAccountByUsername(token)
                .then((account) => {
                    setFullName(account?.username || "Tên của bạn");
                })
                .catch((err) => {
                    console.error("Không thể lấy thông tin shop:", err);
                    setFullName("Không tìm thấy tên shop"); // Hiển thị thông báo nếu lỗi
                });
        } else {
            setFullName("Bạn chưa đăng nhập");
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setLogoutMessage("Đăng xuất thành công!");
        navigate("/login");
        setTimeout(() => setLogoutMessage(""), 3000);
    };

    const goToUserPage = () => {
        navigate("/user"); // Điều hướng đến trang người dùng
    };

    return (
        <div >
            {/* Navbar trên cùng */}
            <div className="top-navbar1 justify-content-end">

                <div className="shop-circle">
                    <span>ADMIN</span>
                </div>
            </div>

            {/* Sidebar */}
            <div className="navbar-container1">
                <div className="navbar-header1 d-flex align-items-center justify-content-between">

                </div>
                <ul className="nav flex-column mb-auto">
                    <li className="nav-item">
                        <NavLink className="navbar-link1" to="account-management" activeClassName="active">
                            <FontAwesomeIcon icon={faUsers} className="me-2"/>
                            Người dùng
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="navbar-link1" to="post-management" activeClassName="active">
                            <FontAwesomeIcon icon={faTags} className="me-2"/>
                            Bài đăng
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="navbar-link1" to="property-management" activeClassName="active">
                            <FontAwesomeIcon icon={faFolder} className="me-2"/>
                            Danh mục
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="navbar-link1" to="properties-values-management" activeClassName="active">
                            <FontAwesomeIcon icon={faFolder} className="me-2"/>
                            Thuộc tính
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="navbar-link1" to="shopRegistration" activeClassName="active">
                            <IoStorefrontSharp  className="me-2"/>
                            Duyệt người bán
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            className="navbar-link1"
                            to="stactial-management"
                            activeClassName="active"
                        >
                            <FontAwesomeIcon icon={faChartPie} className="me-2"/>
                            Thống kê
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
                            Đăng xuất
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
