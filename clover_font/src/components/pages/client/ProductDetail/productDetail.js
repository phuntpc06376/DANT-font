import React from "react";
import { Container, Row, Col, Button, Badge } from "react-bootstrap";
import { FaShoppingCart, FaHeart, FaStar } from "react-icons/fa";

function App() {
  return (
    <Container className="mt-5">
      <Row>
        {/* Phần hình ảnh sản phẩm */}
        <Col md={5}>
          <img
            src="https://via.placeholder.com/150"
            alt="Product"
            className="img-fluid rounded"
          />
        </Col>

        {/* Phần thông tin chi tiết sản phẩm */}
        <Col md={7}>
          <h2 className="mb-3">Tên Sản Phẩm </h2>

          {/* Đánh giá sản phẩm */}
          <div className="mb-3">
            <FaStar color="#FFD700" />
            <FaStar color="#FFD700" />
            <FaStar color="#FFD700" />
            <FaStar color="#FFD700" />
            <FaStar color="#FFD700" />
            <Badge bg="secondary" className="ms-2">500 Đánh giá</Badge>
          </div>

          {/* Giá sản phẩm */}
          <h3 className="text-danger mb-3">₫500,000</h3>

          {/* Mô tả sản phẩm */}
          <p className="mb-4">
            Đây là mô tả sản phẩm. 
          </p>

          {/* Hành động của người dùng */}
          <div className="d-flex">
            <Button variant="danger" className="me-3">
              Mua Ngay
            </Button>
            <Button variant="warning" className="me-3">
              <FaShoppingCart /> Thêm vào giỏ hàng
            </Button>
            <Button variant="outline-secondary">
              <FaHeart /> Thêm vào yêu thích
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
