import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './ProductGallery.css';

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
          <Card.Title className="product-price text-danger">{price} đ</Card.Title>
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

  useEffect(() => {
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

    fetchProducts();
  }, [token]);

  const handleSearch = () => {
    const keyword = searchKeyword.toLowerCase();
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) &&
        product.price >= min &&
        product.price <= max
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
      <h4 className="text-dark mb-4">Tìm kiếm sản phẩm</h4>
      <Row className="mb-4">
        <Col md={4}>
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
        <Col md={3}>
          <Form.Group controlId="minPrice">
            <Form.Label>Giá tối thiểu</Form.Label>
            <Form.Control
              as="select"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="price-select"
            >
              <option value="">Chọn giá tối thiểu</option>
              <option value="0">0</option>
              <option value="50">50,000</option>
              <option value="70">70,000</option>
              <option value="100">100,000</option>
              {/* Thêm nhiều mức giá hơn nếu cần */}
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId="maxPrice">
            <Form.Label>Giá tối đa</Form.Label>
            <Form.Control
              as="select"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="price-select"
            >
              <option value="">Chọn giá tối đa</option>
              <option value="500">50,000</option>
              <option value="1000">100,000</option>
              <option value="2000">200,000</option>
              <option value="3000">300,000</option>
              {/* Thêm nhiều mức giá hơn nếu cần */}
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={2} className="d-flex align-items-end">
          <Button variant="primary" onClick={handleSearch} className="search-button">
            Tìm kiếm
          </Button>
        </Col>
      </Row>

      <h4 className="text-dark mb-4">Kết quả tìm kiếm</h4>
      <Row xs={1} sm={2} md={4} className="g-4">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.name}
            price={product.price}
            location={`${product.shop.city}, ${product.shop.province}`}
            imageUrl={`http://localhost:8080/images/${product.prodImages[0]?.name}`}
          />
        ))}
      </Row>

      <h4 className="text-dark mt-5 mb-4">Những sản phẩm có giá trị giảm dần</h4>
      <Row xs={1} sm={2} md={4} className="g-4">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.name}
            price={product.price}
            location={`${product.shop.city}, ${product.shop.province}`}
            imageUrl={`http://localhost:8080/images/${product.prodImages[0]?.name}`}
          />
        ))}
      </Row>

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
