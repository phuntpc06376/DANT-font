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
        console.log("Fetched Bill Data:", response.data);
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
    <Container className="order-summary-container">
      <h2 className="order-summary-title">Lịch sử mua hàng</h2>

      {billData.map((bill) => (
        <div className="bill-card" key={bill.id}>
          <div className="bill-header">
            <h5>Đơn hàng #{bill.id}</h5>
            <span className="bill-date">
             <strong>Ngày mua:</strong> {new Date(bill.buyDay).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>

          </div>

          <div className="productOrder-row">
            {bill.detailBills && bill.detailBills.length > 0 ? (
              bill.detailBills.map((detail, index) => (
                <div className="productOrder-card" key={index}>
                  <img src={detail.prodImage || "https://via.placeholder.com/80"} alt="productOrder" />
                  <h6>{detail.prodName}</h6>
                  <div className="text-muted">Đơn giá: {formatCurrency(detail.price)}</div>
                  <div className="text-muted">Số lượng: {detail.quantity}</div>
                  <div className="font-weight-bold">Thành tiền: {formatCurrency(detail.totalMoney)}</div>
                </div>
              ))
            ) : (
              <p>No items in this bill.</p>
            )}
          </div>


          <div className="row mt-4">
            <div className="col-md-6">
              <div className="voucher-section">
                <h5>Voucher của Shop</h5>
                <span>Discount Voucher: {bill.discountVoucher || "Không có"}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="shipping-section">
                <h5>Đơn vị vận chuyển</h5>
                <p>Phí vận chuyển: {formatCurrency(bill.shipMoney)}</p>
              </div>
            </div>
          </div>

          <hr />

          <Row className="total-info-row">
            <Col>Tổng tiền hàng:</Col>
            <Col className="text-right">{formatCurrency(bill.totalItemsCost)}</Col>
          </Row>

          <Row className="total-info-row">
            <Col>Phí vận chuyển:</Col>
            <Col className="text-right">{formatCurrency(bill.shipMoney)}</Col>
          </Row>

          <div className="payment-total-row">
            <Col>Tổng thanh toán:</Col>
            <Col className="text-right font-weight-bold">{formatCurrency(bill.totalPayment)}</Col>
          </div>

          <Row className="justify-content-end">
            <Col md="auto">
              <Button className="order-summary-btn" disabled>
                Đặt hàng (Đã hoàn tất)
              </Button>
            </Col>
          </Row>
        </div>
      ))}
    </Container>

  );
};

export default OrderSummary;
