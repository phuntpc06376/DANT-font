import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ id, title, price, location }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <Col onClick={handleCardClick}>
      <Card className="h-100">
        <Card.Img variant="top" src="https://via.placeholder.com/150" />
        <Card.Body className="bg-dark text-light">
          <Card.Title>{price} đ</Card.Title>
          <Card.Text>{title}</Card.Text>
          <Card.Text className="text-muted">{location}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

const ProductGallery = () => (
  <Container className="mt-3">
    <h4 className="text-dark">Lựa chọn hôm nay</h4>
    <Row xs={1} sm={2} md={4} className="g-4">
      <ProductCard id={1} title="Cái Răng" price="1" location="Cái Răng" />
      <ProductCard id={2} title="2022 Honda vario duyệt hồ sơ online siêu dễ" price="3" location="Cần Thơ · 8K km" />
      <ProductCard id={3} title="" price="6.800" location="Vĩnh Long" />
      <ProductCard id={4} title="" price="1.500.000" location="Vĩnh Long" />
      {/* Thêm sản phẩm khác nếu cần */}
    </Row>
  </Container>
);

export default ProductGallery;
