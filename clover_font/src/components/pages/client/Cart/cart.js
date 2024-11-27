import React from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

const CartItem = ({ productName, color, size, price }) => (
  <Card className="mb-3">
    <Card.Body>
      <Row>
        <Col xs={2}> 
          <img
            src="https://via.placeholder.com/100"
            alt="Product"
            className="img-fluid border"
          />
        </Col>
        <Col xs={2} className='mt-4'>
          <h5>{productName}</h5>
        </Col>
        <Col xs={4}>
        <div className="d-flex align-items-center justify-content-end mt-4">
            <Button variant="primary">-</Button>
            <Form.Control type="text" value="1" className="text-center mx-2" style={{ width: '50px' }} />
            <Button variant="primary">+</Button>
          </div>
        </Col>
        <Col xs={4} className="text-end d-flex align-items-center justify-content-end">
          <h6 className="mt-2 m-2">${price}</h6>
          <Button variant="danger" className="me-2">
            <FaTrash />
          </Button>
        </Col>
        
      </Row>
    </Card.Body>
  </Card>
);

const Cart = () => (
  <Container className="mt-4">
    <h4>Cart - 2 items</h4>
    <CartItem productName="Sản phẩm 1"  price="17.99" />
    <CartItem productName="Sản phẩm 2"  price="17.99" />
  </Container>
);

export default Cart;
