import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import "./OrderSummary.css";

const OrderSummary = () => {
  const [billData, setBillData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    const fetchBillData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8080/api/user/bill/getBillByUsername",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        console.log(response);
        
        // Sort the fetched bills by the most recent `buyDay`
        const sortedData = response.data.sort(
          (a, b) => new Date(b.buyDay) - new Date(a.buyDay)
        );

        setBillData(sortedData);
        setFilteredData(sortedData); // Initialize filteredData
        console.log("Sorted Bill Data:", sortedData);
      } catch (error) {
        console.error("Error fetching bill data:", error);
      }
    };

    fetchBillData();
  }, []);

  useEffect(() => {
    if (billData) {
      const filtered = billData.filter((bill) => {
        const productMatches = bill.detailBills.some((detail) =>
          detail.prodName.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const dateMatches = searchDate
          ? new Date(bill.buyDay).toISOString().split("T")[0] === searchDate
          : true;

        return productMatches && dateMatches;
      });

      setFilteredData(filtered);
    }
  }, [searchQuery, searchDate, billData]);

  if (!filteredData) return <div>Loading...</div>;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <Container className="order-summary-container">
      <h2 className="order-summary-title">Lịch sử mua hàng</h2>

      {/* Search Form */}
      <Form className="mb-4">
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Tìm kiếm sản phẩm</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên sản phẩm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Tìm kiếm theo ngày mua</Form.Label>
              <Form.Control
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {/* Display Filtered Bills */}
      {filteredData.length > 0 ? (
        filteredData.map((bill) => (
          <div className="bill-card" key={bill.id}>
            <div className="bill-header">
              <span className="bill-date">
                <h4>
                  <strong>Ngày mua:</strong>{" "}
                  {new Date(bill.buyDay).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </h4>
              </span>
            </div>

            <div className="productOrder-row">
              {bill.detailBills && bill.detailBills.length > 0 ? (
                bill.detailBills.map((detail, index) => (
                  <div className="productOrder-card" key={index}>
                    <img
                      src={
                        detail.prod?.prodImages[0]?.name
                          ? `http://localhost:8080/image/${detail.prod.prodImages[0].name}`
                          : `https://via.placeholder.com/80`
                      }
                      alt="productOrder"
                    />
                    <h6>{detail.prodName}</h6>
                    <div className="text-muted">
                      Đơn giá: {formatCurrency(detail.price)}
                    </div>
                    <div className="text-muted">Số lượng: {detail.quantity}</div>
                    <div className="font-weight-bold">
                      Thành tiền: {formatCurrency(detail.totalMoney)}
                    </div>
                  </div>
                ))
              ) : (
                <p>Chưa có hóa đơn.</p>
              )}
            </div>
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="voucher-section">
                  <h5>Khuyến mãi từ shop</h5>
                  <span>
                    Tiền trừ từ khuyến mãi: {bill.discountVoucher || "Không có"}
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="shipping-section">
                  <h5>Đơn vị vận chuyển</h5>
                  <p>Phí vận chuyển: {formatCurrency(bill.shipMoney)}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address Section */}
            <div className="voucher-section mt-2">
              <h5>Địa chỉ nhận hàng</h5>
              <p>
                <strong>Địa chỉ:</strong> {bill.toAddress || "Không có"}
              </p>
              <p>
                <strong>Quận/Huyện:</strong> {bill.toDistrictName || "Không có"}
              </p>
              <p>
                <strong>Xã/Phường:</strong> {bill.toWardName || "Không có"}
              </p>
            </div>

            <hr />

            <Row className="total-info-row">
              <Col>Tổng tiền hàng:</Col>
              <Col className="text-right">
                {formatCurrency(
                  bill.detailBills.reduce((acc, item) => acc + item.totalMoney, 0)
                )}
              </Col>
            </Row>

            <Row className="total-info-row">
              <Col>Phí vận chuyển:</Col>
              <Col className="text-right">{formatCurrency(bill.shipMoney)}</Col>
            </Row>

            <div className="payment-total-row">
              <Col>Tổng thanh toán:</Col>
              <Col className="text-right font-weight-bold">
                {formatCurrency(
                  bill.detailBills.reduce((acc, item) => acc + item.totalMoney, 0) +
                  bill.shipMoney
                )}
              </Col>
            </div>
            <Row className="justify-content-end">
              <Col md="auto">
                <Button className="order-summary-btn" disabled>
                  {/* Lặp qua từng đơn hàng và hiển thị trạng thái */}
                  <Row className="mb-3">
                    <Col>
                      <Button className="order-summary-btn" disabled>
                        Trạng thái: {bill.status?.name || "Chưa xác định"}
                      </Button>
                    </Col>
                  </Row>
                </Button>
              </Col>
            </Row>
          </div>
        ))
      ) : (
        <div>Chưa có đơn hàng.</div>
      )}
    </Container>
  );
};

export default OrderSummary;
