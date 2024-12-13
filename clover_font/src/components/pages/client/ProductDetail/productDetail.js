import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './productDetail.css';


const ProductDetail = () => {
  const { id } = useParams(); // Get the ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]); // State to hold related products
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
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
  const { name, price = 0, description, ratings = 0, prodImages, shop, quantity } = product;
  const imageUrl = prodImages && prodImages[0] ? `http://localhost:8080/image/${product.prodImages[0]?.name}` : "https://via.placeholder.com/150";

  const shopInfo = shop
    ? {
      name: shop.name,
      address: shop.address,
      city: shop.districtName, // Hoặc có thể là shop.city tùy cách bạn đặt
      province: shop.wardName, // Dùng wardName hoặc sửa lại theo đúng province nếu cần
      nation: "Vietnam", // Nếu quốc gia luôn cố định
    }
    : null;


  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
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
      console.log(formData)
      if (response.ok) {
        toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
    }

  };


  return (
    <Container className="mt-5">
      <ToastContainer />

      <Row>
        <Col md={5}>
          <img
            src={imageUrl} style={{width : "300px" , height : "400px"}}
            alt={name}
            className="productDetail-img"
          />
        </Col>
        <Col md={7}>
          <h2 className="productDetail-title">{name}</h2>
          <div className="productDetail-stars">
            {Array(ratings)
              .fill()
              .map((_, i) => (
                <FaStar key={i} />
              ))}
          </div>
          <h3 className="productDetail-price"> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}</h3>
          <div className="productDetail-description">
            <h5>Mô tả sản phẩm:</h5>
            <p>{description}</p>
            <h6 className="mt-2">Số lượng: {quantity}</h6>
          </div>
          <div>
            <Button className="productDetail-cartButton" onClick={handleAddToCart}>
              <FaShoppingCart /> Thêm vào giỏ hàng
            </Button>
          </div>
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
            <Col md={3} key={relatedProduct.id} className="mb-4 product-grid">
              <Card className="product-card" onClick={() => navigate(`/user/product/${relatedProduct.id}`)} style={{ cursor: 'pointer' }}>
                <Card.Img variant="top" src={relatedProduct.prodImages && relatedProduct.prodImages[0]
                  ? `http://localhost:8080/image/${product.prodImages[0]?.name}`
                  : "https://via.placeholder.com/150"} />
                <Card.Body className="product-content mt-3">
                  <Card.Title className="product-title">{relatedProduct.name}</Card.Title>
                  <Card.Text className="product-price">   
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(relatedProduct.price)}</Card.Text>
               
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
