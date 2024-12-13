import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './ProductGallery.css';
import PriceRangeSelector from './PriceRangeSelector'; // Đường dẫn phù hợp với file của bạn
import WebSocketService from '../../webSocket/WebSocketService';

// Component ProductCard to display each product
const ProductCard = ({ id, title, price, location, imageUrl }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/user/product/${id}`);
  };

  return (
    <Col className="product-grid">
      <Card
        className="h-100 product-card shadow-sm"
        style={{ cursor: 'pointer' }}
        onClick={handleCardClick}
      >
        <div className="card-img-container">
          <Card.Img
            variant="top"
            src={imageUrl || "https://via.placeholder.com/150"}
            className="card-img"
          />
        </div>
        <Card.Body className="text-dark border-5 product-content">
          <Card.Text className="fw-bold product-title">{title}</Card.Text>
          <Card.Title className="product-price text-danger">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
          </Card.Title>
        </Card.Body>
      </Card>
    </Col>
  );
};

// Component ProductGallery to display the list of products
const ProductGallery = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [productsPerPage] = useState(8); // Number of products per page
  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/user/shopping/product', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Cannot load data from server');
      }

      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data); // Set initial filtered products
      setLoading(false);
      console.log(data);

    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  // Tích hợp WebSocket để nhận cập nhật theo thời gian thực
  useEffect(() => {
    WebSocketService.connect(token);

    WebSocketService.onProductUpdate((message) => {
      // Xử lý cập nhật sản phẩm (ví dụ: thêm, cập nhật, xóa sản phẩm)
      console.log('Cập nhật sản phẩm nhận được:', message);
      // Lấy lại sản phẩm mới sau khi có cập nhật
      fetchProducts();
    });

    // Dọn dẹp kết nối WebSocket khi component unmount
    return () => {
      WebSocketService.disconnect();
    };
  }, [token]);

  const handleSearch = () => {
    const keyword = searchKeyword.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) &&
        product.price >= minPrice &&
        product.price <= maxPrice
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <h2 className="loading-message">Loading data...</h2>;
  }

  const sortedProducts = [...currentProducts].sort((a, b) => b.price - a.price);

  return (
    <Container className="mt-4 product-gallery">
      <Row className="mb-4 align-items-center">
        <Col md={5}>
          <Form.Group controlId="searchKeyword">
            <Form.Label>Tên sản phẩm</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên sản phẩm"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
            />
          </Form.Group>
        </Col>
        <Col md={5} className='mt-3'>
          <Form.Label>Khoảng giá</Form.Label>
          <PriceRangeSelector
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
          />
        </Col>
        <Col md={2} className="d-flex justify-content-end mt-3">
          <Button variant="primary" onClick={handleSearch} className="search-button">
            Tìm kiếm
          </Button>
        </Col>
      </Row>

      {/* Container with background color */}
      <Card className="p-4" fluid style={{ backgroundColor: "#eee" }}>
        <Row xs={1} sm={2} md={4} className="g-4">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.name}
              price={product.price}
              location={`${product.shop.city}, ${product.shop.province}`}
              imageUrl={`http://localhost:8080/image/${product.prodImages[0]?.name}`}
            />
          ))}
        </Row>
      </Card>


      {/* Pagination */}
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    </Container>
  );
};

export default ProductGallery;
