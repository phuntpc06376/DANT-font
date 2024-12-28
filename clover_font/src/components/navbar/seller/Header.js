import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartPie,
    faClipboard,
    faUsers,
    faFolder,
    faTags,
    faSignOutAlt,
    faHome
} from "@fortawesome/free-solid-svg-icons";
import "./Header.css"; // Import CSS tùy chỉnh
import { getShopByAccount } from "./accountShop"; // Gọi API lấy tên shop

const Navbar = () => {
    const [logoutMessage, setLogoutMessage] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [shopName, setShopName] = useState("Loading..."); // State để lưu tên shop
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            setIsLoggedIn(true);

            // Gọi API lấy thông tin shop
            getShopByAccount(token)
                .then((shop) => {
                    setShopName(shop?.name || "Shop của bạn");
                })
                .catch((err) => {
                    console.error("Không thể lấy thông tin shop:", err);
                    setShopName("Không tìm thấy tên shop"); // Hiển thị thông báo nếu lỗi
                });
        } else {
            setShopName("Bạn chưa đăng nhập");
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
        <div>
            {/* Navbar trên cùng */}
            <div className="top-navbar2">
                <button className="btn btn-sm btn-outline-secondary" onClick={goToUserPage}>
                    <FontAwesomeIcon icon={faHome} size="2x"/>
                </button>
                <div className="shop-circle">
                    <span>{shopName}</span>
                </div>
            </div>


            {/* Sidebar */}
            <div className="navbar-container2">
                <div className="navbar-header2 d-flex align-items-center justify-content-between">
                    {/* Hiển thị tên shop */}

                </div>
                <ul className="nav flex-column mb-auto">
                    <li className="nav-item">
                        <NavLink className="navbar-link2" to="products" activeClassName="active">
                            <FontAwesomeIcon icon={faClipboard} className="me-2" />
                            Sản phẩm
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="navbar-link2" to="promotions" activeClassName="active">
                            <FontAwesomeIcon icon={faTags} className="me-2" />
                            Khuyến mãi
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="navbar-link2" to="bill" activeClassName="active">
                            <FontAwesomeIcon icon={faFolder} className="me-2" />
                            Hóa đơn
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="navbar-link2" to="staticalseller" activeClassName="active">
                            <FontAwesomeIcon icon={faChartPie} className="me-2" />
                            Thống kê
                        </NavLink>
                    </li>
                </ul>

                {logoutMessage && (
                    <div className="alert alert-success mt-3" role="alert">
                        {logoutMessage}
                    </div>
                )}

                <div className="navbar-footer2">
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
