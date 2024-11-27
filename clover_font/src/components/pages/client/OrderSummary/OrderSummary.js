import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import './OrderSummary.css';

const OrderSummary = () => {
  const [billData, setBillData] = useState(null);

  useEffect(() => {
    const fetchBillData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/user/bill/getBillByUsername', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBillData(response.data);
      } catch (error) {
        console.error("Error fetching bill data:", error);
      }
    };

    fetchBillData();
  }, []);

  if (!billData) return <div>Loading...</div>;

  // Calculate totals
  const totalItemsCost = billData.reduce((acc, bill) => acc + bill.detailBills.reduce((sum, item) => sum + item.totalMoney, 0), 0);
  const totalShippingCost = billData.reduce((acc, bill) => acc + bill.shipMoney, 0);
  const totalPayment = totalItemsCost + totalShippingCost;

  // Format currency
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <Container className="order-history mt-5">
      <h2 className="font-weight-bold mb-4">Lịch sử mua hàng</h2>
      
      {billData.map((bill) => (
        <Card className="mb-4 shadow-sm border-0" key={bill.id}>
          <Card.Body>
            {/* Bill Information */}
            <div className="d-flex justify-content-between">
              <h5 className="font-weight-bold">Đơn hàng #{bill.id}</h5>
              <span className="text-muted">{new Date(bill.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="my-4">
              {bill.detailBills && bill.detailBills.length > 0 ? (
                bill.detailBills.map((detail, index) => (
                  <div className="border product-card p-3 mb-3" key={index}>
                    <div className="d-flex align-items-start">
                      <img src={detail.prodImage || "https://via.placeholder.com/100"} alt="product" width="100" className="mr-3 product-image" />
                      <div className="d-flex flex-column ml-3">
                        <h6 className="font-weight-bold">{detail.prodName}</h6>
                        <div className="text-muted">Đơn giá: {formatCurrency(detail.price)}</div>
                        <div className="text-muted">Số lượng: {detail.quantity}</div>
                        <div className="font-weight-bold">Thành tiền: {formatCurrency(detail.totalMoney)}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No items in this bill.</p>
              )}
            </div>

            <div className="row mt-4">
              <div className="col-md-6">
                <div className="border p-3 voucher-section">
                  <h5 className="font-weight-bold">Voucher của Shop</h5>
                  <span>Discount Voucher: {bill.discountVoucher || "Không có"}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border p-3 shipping-section">
                  <h5 className="font-weight-bold">Đơn vị vận chuyển</h5>
                  <p>Phí vận chuyển: {formatCurrency(bill.shipMoney)}</p>
                </div>
              </div>
            </div>

            <hr />

            {/* Total Payment Information */}
            <Row>
              <Col md={8}>
                <h6 className="text-muted">Tổng tiền hàng:</h6>
              </Col>
              <Col md={4} className="text-right">
                <h6>{formatCurrency(bill.totalItemsCost)}</h6>
              </Col>
            </Row>

            <Row>
              <Col md={8}>
                <h6 className="text-muted">Phí vận chuyển:</h6>
              </Col>
              <Col md={4} className="text-right">
                <h6>{formatCurrency(bill.shipMoney)}</h6>
              </Col>
            </Row>

            <hr />

            <Row>
              <Col md={8}>
                <h5 className="font-weight-bold">Tổng thanh toán:</h5>
              </Col>
              <Col md={4} className="text-right">
                <h5 className="font-weight-bold text-primary">{formatCurrency(bill.totalPayment)}</h5>
              </Col>
            </Row>

            <Row className="justify-content-end">
              <Col md="auto">
                <Button
                  variant="primary"
                  className="font-weight-bold mt-3 shadow-sm rounded-pill"
                  style={{ backgroundColor: '#ff5722', border: 'none', padding: '10px 30px' }}
                  disabled
                >
                  Đặt hàng (Đã hoàn tất)
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default OrderSummary;
