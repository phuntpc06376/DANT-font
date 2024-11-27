import React, { useEffect, useState } from "react";
import './PaymentResult.css';
import { useSearchParams } from "react-router-dom";
const PaymentResult = () => {

    const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [payDate, setPayDate] = useState(null);
const [transactionId, setTransactionId] = useState(null);
  useEffect(() => {
    // Lấy trạng thái từ query parameters
    const statusParam = searchParams.get("status");
    const amount = searchParams.get("amount");
    const orderId = searchParams.get("orderId");
    const payDate = searchParams.get("payDate");
    const transactionId = searchParams.get("transactionNo");
    setStatus(statusParam);
    setAmount(amount);
    setOrderId(orderId);
    setPayDate(payDate);
    setTransactionId(transactionId);
    // Chuyển chuỗi thành đối tượng Date
const year = payDate.slice(0, 4);
const month = payDate.slice(4, 6) - 1; // Tháng trong JavaScript bắt đầu từ 0 (tháng 0 là tháng 1)
const day = payDate.slice(6, 8);
const hour = payDate.slice(8, 10);
const minute = payDate.slice(10, 12);
const second = payDate.slice(12, 14);

// Tạo đối tượng Date
const date = new Date(year, month, day, hour, minute, second);

// Định dạng lại ngày và giờ
const formattedDate = date.toLocaleString('vn-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}).replace(',', '').replace('/', '-').replace('/', '-');
setPayDate(formattedDate);

    if (statusParam === "success") {
      console.log(`Thanh toán thành công cho đơn hàng: ${orderId} ${amount} ${payDate}`);
    } else {
      console.log(`Thanh toán thất bại`);
    }
  }, [searchParams]);

    return (
        <div className="payment-result-container">
            <div className="payment-header">
                <h2>Kết quả thanh toán</h2>
            </div>
           {status === 'success' &&  <div className="payment-details">
                <div className="detail">
                    <label>Mã đơn hàng:</label>
                    <span>{orderId}</span>
                </div>
                <div className="detail">
                    <label>Trạng thái:</label>
                    <span className={ status === 'success' ? 'text-success' : 'text-danger'}>{status}</span>
                </div>
                <div className="detail">
                    <label>Tổng tiền:</label>
                    <span>{amount} VND</span>
                </div>
                <div className="detail">
                    <label>Mã giao dịch:</label>
                    <span>{transactionId}</span>
                </div>
                <div className="detail">
                    <label>Ngày thanh toán:</label>
                    <span>{payDate}</span>
                </div>
            </div>}
            <div className="actions">
                <button className="btn-continue" onClick={() => window.location.href = '/shopping'}>
                    Tiếp tục mua sắm
                </button>
                <button className="btn-home" onClick={() => window.location.href = '/'}>
                    Về trang chủ
                </button>
            </div>
        </div>
    );
};

export default PaymentResult;
