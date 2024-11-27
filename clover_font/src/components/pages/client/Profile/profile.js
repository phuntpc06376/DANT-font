import React, { useState, useEffect } from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Lưu ý cú pháp import
// Thư viện giải mã token
import "./ProfilePage.css";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ email: "", phoneNumber: "", fullname: "" });

  const [updatedData, setUpdatedData] = useState({
    fullname: "",
    gender: ""
  });
  const [avatar, setAvatar] = useState(null);

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null; // Giải mã token
  const username = decodedToken?.sub; // Lấy `username` từ payload (thường là `sub`)


  // Lấy thông tin tài khoản
  useEffect(() => {
    if (!username) {
      setError("Không tìm thấy thông tin người dùng trong token.");
      setIsLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/account/getByUsername",
          {
            params: { username },
            headers: {
              Authorization: `Bearer ${token || ""}`,
            },
          }
        );
        console.log(response.data);
        if (response.data) {
          setProfileData(response.data);
          setUpdatedData({
            fullname: response.data.fullname || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
            gender: response.data.gender
          });
        } else {
          throw new Error("Không tìm thấy dữ liệu tài khoản.");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Không thể tải dữ liệu hồ sơ. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [token, username]);
  //
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Redirecting to login...");
      return;
    }

    try {
      const url = new URL("http://localhost:8080/api/post/getByUsername");
      url.searchParams.append("username", username);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUpdatedData((prevData) => ({
      ...prevData,
      [name]: name === "gender" ? value === "true" : value, // Xử lý gender riêng
    }));
  };

  const handleUpdate = async () => {
    if (!username) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không xác định được người dùng.',
      });
      return;
    }

    // Kiểm tra xem trường nào bị bỏ trống
    const fields = [
      { key: 'fullname', message: 'Tên đầy đủ không được bỏ trống.' },
      { key: 'email', message: 'Email không được bỏ trống.' },
      { key: 'phone', message: 'Số điện thoại không được bỏ trống.' },
    ];
    for (const field of fields) {
      if (!updatedData[field.key]) {
        Swal.fire({
          icon: 'warning',
          title: 'Lỗi!',
          text: field.message,
        });
        return;
      }
    }

    // Kiểm tra độ dài của fullname
    if (updatedData.fullname.length < 5 || updatedData.fullname.length > 20) {
      Swal.fire({
        icon: 'warning',
        title: 'Lỗi!',
        text: 'Vui lòng nhập tên đầy đủ từ 5 đến 20 ký tự.',
      });
      return;
    }

    // Hàm kiểm tra email và số điện thoại hợp lệ
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone) => /^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/.test(phone);

    if (!isValidEmail(updatedData.email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Email không hợp lệ.',
      });
      return;
    }

    if (!isValidPhone(updatedData.phone)) {
      Swal.fire({
        icon: 'warning',
        title: 'Số điện thoại phải đúng định dạng +84 và từ 9-10 chữ số.',
      });
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/home/account/updateInfor/${username}`,
        {
          id: username,
          fullname: updatedData.fullname,
          email: updatedData.email,
          phone: updatedData.phone,
          gender: updatedData.gender,
        },
        {
          headers: {
            Authorization: `Bearer ${token || ""}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data) {
        setProfileData(response.data);
        setIsEditing(false);
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Thông tin đã được cập nhật thành công!',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Có lỗi xảy ra!',
          text: 'Không thể cập nhật thông tin. Vui lòng thử lại.',
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);
      Swal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra khi cập nhật thông tin.',
        text: err.response?.data || err.message,
      });
    }
  };




  // Xử lý thay đổi ảnh đại diện
  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };


  //load sản phẩm của người dùng đó
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token"); // Giả sử token lưu trong localStorage
        const response = await axios.get("http://localhost:8080/api/sell/product/getProductBySeller", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Có lỗi khi tải sản phẩm", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);


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


  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h4>{error}</h4>
        <p>Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Cover Section */}
      <div className="cover-section">
        <div className="avatar">
          <img
            src={
              profileData.avatar
                ? `http://localhost:8080/uploads/avatars/${profileData.avatar}`
                : "https://via.placeholder.com/150"
            }
            alt="User Avatar"
            className="avatar-img"
          />
          {/* {isEditing && (
            <input type="file" onChange={handleFileChange} className="file-input" />
          )} */}
        </div>
      </div>

      {/* Profile Info */}
      <div className="profile-info">
        {isEditing ? (
          <div className="container mt-5">
            <h2 className="text-center mb-4">Chỉnh sửa thông tin</h2>
            <form>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  name="fullname"
                  value={updatedData.fullname}
                  onChange={handleInputChange}
                  className="form-control"
                  id="fullname"
                  placeholder="Tên đầy đủ"
                />
                <label htmlFor="fullname">Tên đầy đủ</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="email"
                  name="email"
                  value={updatedData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  id="email"
                  placeholder="Email"
                />
                <label htmlFor="email">Email</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="text"
                  name="phone"
                  value={updatedData.phone}
                  onChange={handleInputChange}
                  className="form-control"
                  id="phone"
                  placeholder="Số điện thoại"
                />
                <label htmlFor="phone">Số điện thoại</label>
              </div>
              <div className="form-group mb-3">
                <label className="mb-2">Giới tính</label>
                <div>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      name="gender"
                      value={false}
                      checked={updatedData.gender === false}
                      onChange={handleInputChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Nam</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      name="gender"
                      value={true}
                      checked={updatedData.gender === true}
                      onChange={handleInputChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Nữ</label>
                  </div>
                </div>
              </div>


            </form>
          </div>
        ) : (
          <>
            <h2 className="profile-name">{profileData.fullname || "Tên người dùng"}</h2>
            <hr></hr>
            <p className="profile-bio"><strong>Email: </strong>{profileData.email || "Chưa có thông tin email."}</p>
            <p className="profile-bio"><strong>Số điện thoại: </strong>{profileData.phone || "Chưa có thông tin số điện thoại."}</p>
            <p className="profile-bio"><strong>Giới tính: </strong>
              {profileData.gender === true ? "Nữ" : profileData.gender === false ? "Nam" : "Chưa cập nhật"}
            </p>


          </>
        )}

      </div>
      {/* Profile Actions */}
      <div className="profile-actions">
        {isEditing ? (
          <>
            <button className="btn btn-primary px-4 save-btn" onClick={handleUpdate}>
              Lưu thay đổi
            </button>
            <button className="btn btn-danger px-4 cancel-btn" onClick={() => setIsEditing(false)}>
              Hủy
            </button>
          </>
        ) : (
          <button className="btn edit-btn" onClick={() => setIsEditing(true)}>
            Chỉnh sửa trang cá nhân
          </button>
        )}
      </div>
      <Tabs
        defaultActiveKey="profile"
        id="uncontrolled-tab-example"
        className="mb-3 text-center"
      >
        <Tab eventKey="home" title="Bài đăng" className="text-center">
          {loading ? (
            <p>Đang tải bài đăng...</p>
          ) : posts.length === 0 ? (
            <p>Không có bài đăng nào để hiển thị.</p>
          ) : (
            <div className="post-list">
              {posts.map((post) => (
                <div className="post-card" key={post.id}>
                  {/* Header */}
                  <div className="post-header">
                    <img
                      className="post-avatar"
                      src={
                        post.account?.avatar
                          ? `http://localhost:8080/uploads/avatars/${post.account.avatar}`
                          : "https://via.placeholder.com/50"
                      }
                      alt="Avatar"
                    />
                    <div className="post-info">
                      <h4>{post.account?.fullname || "Người dùng"}</h4>
                      <p>{new Date(post.postDay).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Content */}
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

                  {/* Footer */}
                  <div className="post-footer">
                    <button className="like-button">Số lượt thích:{post.numberLikes}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tab>
        <Tab eventKey="profile" title="Cửa hàng" className="text-center">
          <h3>Cửa hàng</h3>
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <div>
              <div className="product-grid">
                {paginateProducts(products).map((prod) => (
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
                      <p className="product-price">{prod.price.toLocaleString()} VND</p>
                    </div>
                  </div>
                ))}
              </div>

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
          )}
        </Tab>


      </Tabs>
    </div>
  );
};

export default ProfilePage;
