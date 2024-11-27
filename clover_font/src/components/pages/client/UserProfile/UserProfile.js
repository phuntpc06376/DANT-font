import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import CryptoJS from 'crypto-js';
const UserProfile = () => {
  const { userName } = useParams(); // Lấy username từ URL params
  const decodedUserName = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(userName));
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (!storedToken) {
      setError("Authorization token is missing.");
    }
  }, []);

  // Lấy thông tin hồ sơ người dùng
  useEffect(() => {
    if (!token) return;

    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/account/getByUsername?username=${decodedUserName}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        setError(`Error fetching user profile: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userName, token]);

  // Lấy bài đăng của người dùng
  useEffect(() => {
    if (!token) return;

    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/post/getByUsername?username=${decodedUserName}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Error fetching posts: ${response.status}`);
        }
        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(`Error fetching posts: ${error.message}`);
      }
    };

    fetchPosts();
  }, [userName, token]);

  //Lấy sản phẩm từ shop
  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/sell/product/getShopByUsername?username=${decodedUserName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Log the response for debugging
        console.log("Products API response:", response.data);

        // Safely access products field
        const productsData = response.data?.products ?? []; // Fallback to an empty array if products is undefined
        setProducts(productsData);
      } catch (error) {
        console.error("Có lỗi khi tải sản phẩm:", error.message);
        setProducts([]); // Ensure state is updated to avoid undefined errors
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [decodedUserName, token]);



  //đường dẫn đến chhi tiết sản phẩm
  const navigate = useNavigate();
  const handleCardClick = (id) => {
    navigate(`/user/product/${id}`);
  };

  //phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Số sản phẩm trên mỗi trang
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginateProducts = (products) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Cover Section */}
      <div className="cover-section">
        <div className="avatar">
          <img
            className="avatar-img"
            src={
              profileData.avatar
                ? `http://localhost:8080/uploads/avatars/${profileData.avatar}`
                : "https://via.placeholder.com/100"
            }
            alt="Avatar"
          />
        </div>
      </div>
      {/* Profile Info */}
      <div className="profile-info">
        <h2 className="profile-name">{profileData.fullname || "User"}</h2>
        <p className="profile-email">Email: {profileData.email || "N/A"}</p>
      </div>
      {/* About Section */}
      <div className="about-section">
        <h3 className="about-title">About</h3>
        <p className="about-text">{profileData.about || "This user has no bio yet."}</p>
      </div>
      {/* Post List Section */}
      <Tabs
        defaultActiveKey="profile"
        id="uncontrolled-tab-example"
        className="mb-3 mt-3"
      >
        <Tab eventKey="home" title="Bài đăng ">
          <div className="post-list">
            {posts.length === 0 ? (
              <p>Người dùng này chưa có bài đăng nào.</p>
            ) : (
              posts.map((post) => (
                <div className="post-card" key={post.id}>
                  <div className="post-header">
                    <img
                      className="post-avatar"
                      src={
                        post.account?.avatar
                          ? `http://localhost:8080/uploads/avatars/${post.account.avatar}`
                          : "https://via.placeholder.com/50"
                      }
                      alt="User Avatar"
                    />
                    <div className="post-info">
                      <h4>{post.account?.fullname || "Người dùng"}</h4>
                      <p>{new Date(post.postDay).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="post-content">
                    <p>{post.content}</p>
                    {post.postImages?.length > 0 && (
                      <div className="post-images">
                        {post.postImages.map((image) => (
                          <img
                            key={image.id}
                            src={`http://localhost:8080/uploads/posts/${image.nameImage}`}
                            alt="Post"
                            className="post-image"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="post-footer">
                    <button className="like-button">Số lượt thích: {post.numberLikes}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Tab>
        <Tab eventKey="profile" title="Cửa hàng" className="text-center">
          <div className="product-grid">
            {loading ? (
              <p>Đang tải...</p>
            ) : products.length > 0 ? ( // Ensure products is always an array
              paginateProducts(products).map((prod) => (
                <div
                  key={prod.id}
                  className="product-card"
                  onClick={() => handleCardClick(prod.id)}
                >
                  <img
                    src={prod.image || "https://via.placeholder.com/250"}
                    alt={prod.name}
                  />
                  <div className="product-content mt-3">
                    <h5 className="product-title">{prod.name}</h5>
                    <p className="product-description">{prod.description}</p>
                    <p className="product-price">{prod.price} VND</p>
                  </div>
                </div>
              ))
            ) : (
              <p>Không có sản phẩm nào.</p>
            )}
            {/* Pagination Controls */}
            {/* Pagination Controls */}
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={currentPage === index + 1 ? "active" : ""}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>

          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default UserProfile;
