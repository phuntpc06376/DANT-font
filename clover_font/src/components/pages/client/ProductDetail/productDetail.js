import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './productDetail.css';
import Swal from 'sweetalert2';
import { Carousel } from "react-bootstrap";
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { Label } from "recharts";

const ProductDetail = () => {
  const { id } = useParams(); // Get the ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]); // State to hold related products
  const navigate = useNavigate();
  const [showAllImages, setShowAllImages] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Gọi API backend
          fetch('http://localhost:8080/api/account', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`, // Gửi token trong header Authorization
            },
          })
            .then((response) => {
              if (response.ok) {
                response.json().then((data) => {
                  console.log("data === ", data);

                  const currentUserName1 = data;

                  setCurrentUser(currentUserName1);
                }); // Chờ phản hồi JSON từ API
              } else {
                throw new Error('Lỗi khi lấy tài khoản');
              }
            })

            .catch((err) => {
              console.error(err);

            });
        } else {

        }
        const response = await fetch(`http://localhost:8080/api/user/shopping/product/getProductById?id=${id}`);
        const data = await response.json();
        setProduct(data);

        const relatedResponse = await fetch(`http://localhost:8080/api/user/shopping/product`);
        const relatedData = await relatedResponse.json();
        const filteredRelatedProducts = relatedData
          .filter((relatedProduct) => relatedProduct.id !== data.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        setRelatedProducts(filteredRelatedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]); // <--- Lắng nghe id để tái render khi chuyển sản phẩm


  if (loading) {
    return <p>Đang tải chi tiết sản phẩm...</p>;
  }

  if (!product) {
    return <p>Không tìm thấy sản phẩm</p>;
  }

  // Destructure product and shop information
  const { name, price = 0, description, ratings = 0, prodImages, shop, quantity, promotion = {} } = product;
  const imageUrls = prodImages && prodImages.length > 0
    ? prodImages.map(image => `http://localhost:8080/image/${image.name}`)
    : ["https://via.placeholder.com/150"]; // Default image if no images exist

  const shopInfo = shop
    ? {
      name: shop.name,
      address: shop.address,
      city: shop.districtName, // Hoặc có thể là shop.city tùy cách bạn đặt
      province: shop.wardName, // Dùng wardName hoặc sửa lại theo đúng province nếu cần
      nation: "Vietnam", // Nếu quốc gia luôn cố định
    }
    : null;

  // Tính salePrice nếu có promotion
  const salePrice = promotion.percentDiscount
    ? price - (price * promotion.percentDiscount / 100)
    : 0;


  // Handle add to cart


  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.',
        });
        return;
      }

      // Create a FormData object and add the product ID and quantity
      const formData = new FormData();
      formData.append("id", id); // The product ID
      formData.append("quantity", 1); // Default quantity of 1

      const response = await fetch(`http://localhost:8080/api/user/shopping/product/addToCart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // Include authorization header
        },
        body: formData, // Pass the FormData object as the request body
      });

      if (response.ok) {
        // Show success SweetAlert2 notification
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Sản phẩm đã được thêm vào giỏ hàng!',
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: errorData.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.",
        });
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.',
      });
    }
  };


  return (
    <Container className="mt-5" >
      <Row >
        <Col md={1}>
        </Col>
        <Col md={5}>
          <div className="" style={{ right: "20px", width: "350px", height: "400px" }}>
            <div className="productDetail-images card">
              <Carousel
                interval={3000}
                controls={true}
                indicators={true}
                pause="hover"
                prevIcon={<FaChevronLeft style={{ fontSize: "30px", color: "#000" }} />}
                nextIcon={<FaChevronRight style={{ fontSize: "30px", color: "#000" }} />}
              >
                {imageUrls.map((url, index) => (
                  <Carousel.Item key={index}>
                    <img
                      src={url}
                      alt={`Product Image ${index + 1}`}
                      style={{ width: "100%", height: "400px", objectFit: "cover" }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>

            </div>
          </div>

        </Col>
        <Col md={5}>
          <div className="product-detail-content">
            <h2 className="productDetail-title">{name}</h2>
            <h3 className="productDetail-price">
              {salePrice > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        textDecoration: 'line-through',
                        fontSize: '16px',
                        color: '#6c757d',
                        marginRight: '10px',
                      }}
                    >
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                    </span>
                    <span
                      style={{
                        fontSize: '16px',
                        color: '#ff6f00',
                        marginLeft: '10px',
                      }}
                    >
                      {`(Giảm ${promotion.percentDiscount}% )`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="text-danger" style={{ fontSize: '25px', marginTop: '5px' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salePrice)}
                    </span>
                  </div>
                </div>
              ) : (
                <span>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </span>
              )}
            </h3>


            <div className="productDetail-description border-1">
              <div style={{ fontWeight: "bold" }}>Mô tả sản phẩm:</div>
              <p>{description}</p>
              <h6 className="mt-2"><strong>Loại sản phẩm:</strong> {product?.prodType.name}</h6>
              <h6 className="mt-2"><strong>Thuộc tính:</strong>
                {product.propertiesValues.map((propertiesValue, index) => (
                  <span key={index}
                    style={{
                      display: 'inline-block',
                      marginLeft: '5px',
                      padding: '5px 10px',
                      backgroundColor: '#f0f0f0', // Màu nền
                      border: '1px solid #ccc', // Viền
                      borderRadius: '5px', // Bo góc
                      cursor: 'default', // Con trỏ không cho nhấn
                      fontSize: '14px',
                    }}
                  >
                    {propertiesValue?.name}
                  </span>
                ))}
              </h6>
              <h6 className="mt-2"><strong>Số lượng:</strong> {quantity}</h6>
            </div>
            {currentUser?.shop?.id !== shop?.id ? (<div className="mt-5">
              <Button className="productDetail-cartButton" onClick={handleAddToCart}>
                <FaShoppingCart /> Thêm vào giỏ hàng
              </Button>
            </div>) : (<div className="mt-5">
              <Button className="productDetail-cartButton" disabled>
                <FaShoppingCart /> Thêm vào giỏ hàng
              </Button>
            </div>)}
          </div>
        </Col>

        <Col md={1}>
        </Col>
      </Row>
      {shopInfo && (
        <Row className="mt-4 bg-light p-3 rounded">
          <Col md={12}>
            <p>
              <strong>Tên cửa hàng:</strong> {shopInfo.name}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {shopInfo.address}
            </p>
            <p>
              <strong>Thành phố:</strong> {shopInfo.city}
            </p>
            <p>
              <strong>Tỉnh/Thành phố:</strong> {shopInfo.province}
            </p>
            <p>
              <strong>Quốc gia:</strong> {shopInfo.nation}
            </p>

          </Col>
        </Row>
      )}

      <Row className="mt-5">
        <Col md={12}>
          <h4 className="mb-3">Sản phẩm khác</h4>
        </Col>
        {relatedProducts.length > 0 ? (
          relatedProducts.map((relatedProduct) => (
            <Col md={3} key={relatedProduct} className="mb-4 product-grid">
              <Card className="product-card" onClick={() => navigate(`/user/product/${relatedProduct.id}`)} style={{ cursor: 'pointer' }}>
                <Card.Img variant="top" src={relatedProduct.prodImages && relatedProduct.prodImages[0]
                  ? `http://localhost:8080/image/${relatedProduct.prodImages[0]?.name}`
                  : "https://via.placeholder.com/150"} />
                <Card.Body className="product-content mt-3">
                  <Card.Title className="product-title">{relatedProduct.name}</Card.Title>

                  <Card.Text className="product-price">
                    {(relatedProduct.price - (relatedProduct.price * relatedProduct.promotion.percentDiscount / 100)) > 0 ? (
                      <>
                        <div style={{ textDecoration: 'line-through', fontSize: '14px', color: '#6c757d', marginRight: '10px' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(relatedProduct.price)}
                        </div>
                        <div className="text-danger" style={{ fontSize: '16px' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((relatedProduct.price - (relatedProduct.price * relatedProduct.promotion.percentDiscount / 100)))}
                        </div>
                      </>
                    ) : (
                      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(relatedProduct.price)
                    )}
                  </Card.Text>

                  <p style={{ fontSize: "12px", margin: 0 }}>{relatedProduct?.shop?.name}</p>

                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>Không có sản phẩm nào để hiển thị</p>
        )}
      </Row>
    </Container>
  );
};

export default ProductDetail;
