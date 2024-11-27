import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row, Form, Spinner, Alert } from "react-bootstrap";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete } from 'react-icons/ai';
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from 'axios';

export default function ProductCards() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Fetch cart data from API
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8080/api/user/shopping/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(response.data);
      calculateTotal(response.data);
    } catch (err) {
      setError("Error fetching cart items.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const groupByShop = (items) => {
    return items.reduce((groups, item) => {
      const shopId = item?.prod?.shop?.id || "unknown"; // Sử dụng `id` của shop làm khóa
      const shopName = item?.prod?.shop?.name || "Unknown Shop"; // Tên cửa hàng để hiển thị
  
      if (!groups[shopId]) {
        groups[shopId] = { name: shopName, items: [] };
      }
      groups[shopId].items.push(item);
      return groups;
    }, {});
  };
  
  const groupedCartItems = groupByShop(cartItems);

  useEffect(() => {
    if (token) fetchCart();
  }, [token]);

  const calculateTotal = (items) => {
    const total = items.reduce((acc, item) => acc + (item.prod?.price || 0) * item.quantity, 0);
    setTotalPrice(total);
  };

  const handleIncrease = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/user/shopping/cart/increase?id=${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedItems = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
      toast.success("Quantity increased!");
    } catch (error) {
      console.error("Error increasing quantity:", error);
      toast.error("Failed to increase quantity.");
    }
  };

  const handleDecrease = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/user/shopping/cart/decrease?id=${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedItems = cartItems.map((item) =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      );
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
      toast.success("Quantity decreased!");
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      toast.error("Failed to decrease quantity.");
    }
  };

  const handleRemove = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/user/shopping/cart/delete?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedItems = cartItems.filter((item) => item.id !== id);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
      toast.success("Item removed from cart.");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item from cart.");
    }
  };

  const handlePayment = () => {
    if (selectedItems.length === 0) {
        toast.error("Vui lòng chọn sản phẩm để đặt hàng.");
        return;
    }
    // Lưu danh sách ID các sản phẩm đã chọn vào localStorage
    localStorage.setItem('ids', selectedItems);
    navigate("/user/order");
};


  const handleSelect = (itemId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(itemId)
        ? prevSelected.filter(id => id !== itemId)
        : [...prevSelected, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const allItemIds = cartItems.map(item => item.id);
      setSelectedItems(allItemIds);
    }
    setSelectAll(!selectAll);
  };

  return (
    <section className="h-100" style={{ backgroundColor: "#eee" }}>
      <Container className="py-5 h-100">
        <Row className="justify-content-center align-items-center h-100">
          <Col md="10">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-normal mb-0 text-black">Giỏ hàng của bạn</h3>
              <Form.Check
                type="checkbox"
                label="Select All"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </div>

            {loading ? (
              <Spinner animation="border" />
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : cartItems.length === 0 ? (
              <p>No products in your cart.</p>
            ) : (
              Object.entries(groupedCartItems).map(([shopId, group]) => (
                <div key={shopId} className="mb-4">
                  <h5 className=" text-secondary">{group.name}</h5> {/* Hiển thị tên cửa hàng */}
                  {group.items.map((item) => (
                    <Card className="rounded-3 mb-4" key={item.id}>
                      <Card.Body className="p-4">
                        <Row className="justify-content-between align-items-center">
                          <Col md="1">
                            <Form.Check
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleSelect(item.id)}
                            />
                          </Col>
                          <Col md="2">
                            <Card.Img
                              className="rounded-3"
                              src={item.prod?.image ? `http://localhost:8080/images/${item.prod.image}` : "https://via.placeholder.com/150"}
                              alt={item.prod?.name || "Product Image"}
                            />
                          </Col>
                          <Col md="3">
                            <p className="lead fw-normal mb-2">{item.prod?.name || "Unknown Product"}</p>
                          </Col>
                          <Col md="2" className="d-flex align-items-center justify-content-around">
                            <Button variant="link" className="px-2" onClick={() => handleDecrease(item.id)}>
                              <AiOutlineMinus />
                            </Button>
                            <Form.Control className="text-center" min={0} value={item.quantity} type="number" readOnly size="sm" />
                            <Button variant="link" className="px-2" onClick={() => handleIncrease(item.id)}>
                              <AiOutlinePlus />
                            </Button>
                          </Col>
                          <Col md="2" className="d-flex align-items-center justify-content-end">
                            <h5 className="mb-0">{(item.prod?.price * item.quantity).toFixed(2)} VNĐ</h5>
                          </Col>
                          <Col md="1" className="d-flex align-items-center justify-content-end">
                            <Button variant="link" className="text-danger" onClick={() => handleRemove(item.id)}>
                              <AiOutlineDelete size={24} />
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ))
              
              
            )}

            {cartItems.length > 0 && !loading && (
              <Card className="rounded-3 mb-4">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md="6" className="d-flex justify-content-start">
                      <h5 className="mb-0">Total: {totalPrice.toFixed(2)} VNĐ</h5>
                    </Col>
                    <Col md="6" className="d-flex justify-content-end">
                      <Button variant="warning" size="lg" onClick={handlePayment} disabled={selectedItems.length === 0}>
                        Create Order
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
}
