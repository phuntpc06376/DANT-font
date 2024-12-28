import React, { useState, useEffect } from 'react';
import { Navbar, Form, FormControl, Container, Row, Col, Dropdown } from 'react-bootstrap';
import { CgProfile } from "react-icons/cg";
import { IoMdMenu } from "react-icons/io";
import Logo from '../../images/Logo5.ico';
import { FaCartShopping } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import { IoLogOutOutline } from "react-icons/io5";
import { RiMessengerLine } from "react-icons/ri";
import { FaShop } from "react-icons/fa6";
import { CgSync } from "react-icons/cg";
import axios from "axios";


const FacebookNavbar = () => {
  const navigate = useNavigate();

  // State to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if the token exists in localStorage to determine if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchCurrentUser(token);
      checkRoleSellOrBuy(token);
    }
  }, []);

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');

    // Update state to reflect that the user is logged out
    setIsLoggedIn(false);

    // Set a logout success message
    setLogoutMessage('Logout successful!');

    // Redirect to the login page
    navigate('/');

    // Hide the message after 3 seconds
    setTimeout(() => setLogoutMessage(''), 3000);
  };

  const checkRoleSellOrBuy = async (token) => {
    try {
      const responseRole = await axios.get("http://localhost:8080/api/login/checkRoleSell", {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      setUserRole(responseRole.data.data);
    } catch (error) {
      console.error("Error checking role:", error);
      setUserRole(null); // Đặt null nếu API lỗi
    }

  };

  const fetchCurrentUser = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/api/account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };


  return (
    <>
      <Navbar bg="light" expand="lg" className="border border-gray rounded shadow-sm">
        <Container fluid>
          <Row className="w-100 align-items-center">
            {/* Logo */}
            <Col xs="auto" className="d-flex align-items-center">
              <Navbar.Brand href="/index">
                <img
                  src={Logo}
                  width="60"
                  height="50"
                  className="d-inline-block align-top"
                  alt="Logo"
                />
                {isLoggedIn && currentUser && (
                  <div className="ms-3">
                    {/* Avatar Image with Link */}
                    <Link to="/user/profile" className="avatar-link">
                      <img
                        className="avatar-img"
                        src={currentUser.avatar ? `http://localhost:8080/image/${currentUser.avatar}` : "https://via.placeholder.com/100"}
                        alt="Avatar"
                        style={{ width: '40px', height: '40px', marginRight: '10px', borderRadius: '50%' }}
                      />
                    </Link>
                  </div>
                )}

              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
            </Col>
            {/* Search bar */}
            <Col className="p-3 d-flex justify-content-center align-items-center">

            </Col>
            {/* Dropdown with user actions */}
            <Col xs="auto" className="d-flex align-items-center justify-content-end">
              {/* Icon giỏ hàng với khoảng cách */}
              <a href="/user/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
                <FaCartShopping style={{ fontSize: '1.5rem', marginRight: '15px' }} />
              </a>
              <a href="/user/chat" style={{ textDecoration: 'none', color: 'inherit' }}>
                <RiMessengerLine style={{ fontSize: '1.5rem', marginRight: '15px' }} />
              </a>


              {/* Dropdown menu */}
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-basic" className="fs-4 no-caret">
                  <IoMdMenu style={{ fontSize: '1.5rem' }} />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {/* <Dropdown.Item href="chat">
                    <RiMessengerLine style={{ fontSize: '1.5rem', marginRight: '10px' }} />
                    Nhắn tin
                  </Dropdown.Item> */}
                  <Dropdown.Item href="profile">
                    <CgProfile style={{ fontSize: '1.5rem', marginRight: '10px' }} />
                    Thông tin cá nhân
                  </Dropdown.Item>
                  <Dropdown.Item href="ChanPass">
                    <CgSync style={{ fontSize: "1.5rem", marginRight: "10px" }} />
                    Đổi mật khẩu
                  </Dropdown.Item>
                  {/* Hiển thị tùy chọn dựa trên vai trò người dùng */}
                  {userRole === 2 && (
                    <Dropdown.Item href="/seller/*">
                      <FaShop style={{ fontSize: '1.5rem', marginRight: '10px' }} />
                      Kênh người bán
                    </Dropdown.Item>
                  )}
                  {userRole === 3 && (
                    <Dropdown.Item href="/user/shopRegister">
                      <FaShop style={{ fontSize: '1.5rem', marginRight: '10px' }} />
                      Đăng ký người bán
                    </Dropdown.Item>
                  )}
                  {isLoggedIn && (
                    <Dropdown.Item onClick={handleLogout}>
                      <IoLogOutOutline style={{ fontSize: '1.5rem', marginRight: '10px' }} />
                      Đăng xuất
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Container>
      </Navbar>
      {/* Show the logout success message */}
      {logoutMessage && (
        <div className="alert alert-success text-center" role="alert">
          {logoutMessage}
        </div>
      )}
    </>
  );
};

export default FacebookNavbar;
