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
const [responseMessage, setResponseMessage] = useState(null);
  useEffect(() => {
    // Lấy trạng thái từ query parameters
    const statusParamRes = searchParams.get("status");
    const amountRes = searchParams.get("amount");
    const orderIdRes = searchParams.get("orderId");
    const payDateRes = searchParams.get("payDate");
    const transactionIdRes = searchParams.get("transactionNo");
    const responseCodeRes = searchParams.get("responseCode");
    setStatus(statusParamRes);
    setAmount(amountRes);
    setOrderId(orderIdRes);
    setPayDate(payDateRes);
    setTransactionId(transactionIdRes);
    // setResponseCode(responseCodeRes);
    console.log(responseCodeRes);
    
    // Chuyển chuỗi thành đối tượng Date
    if (payDateRes) {
        const year = payDateRes.slice(0, 4);
        const month = payDateRes.slice(4, 6) - 1; // JavaScript months start from 0
        const day = payDateRes.slice(6, 8);
        const hour = payDateRes.slice(8, 10);
        const minute = payDateRes.slice(10, 12);
        const second = payDateRes.slice(12, 14);
      
        const date = new Date(year, month, day, hour, minute, second);
      
        const formattedDate = date.toLocaleString('vn-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(',', '').replace('/', '-').replace('/', '-');
        setPayDate(formattedDate);
      } else {
        setPayDate("Không rõ ngày thanh toán");
      }
      

    if (statusParamRes === "success") {
      console.log(`Thanh toán thành công cho đơn hàng: ${orderId} ${amount} ${payDate}`);
    } else {
      console.log(`Thanh toán thất bại`);
    }

    switch(responseCodeRes) {
      case '00':  // if (x === 'value1')
        //code here
       setResponseMessage('Giao dịch thành công');
       break;
      case '07':  // if (x === 'value2')
        //code here
        setResponseMessage('Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).');
        break;
        case '09':  // if (x === 'value2')
        //code here
        setResponseMessage( 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.');
        break;
        case '10':  // if (x === 'value2')
        //code here
        setResponseMessage('Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần');
        break;
        case '11':  // if (x === 'value2')
        //code here
        setResponseMessage('Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.');
        break;
        case '12':  // if (x === 'value2')
        //code here
        setResponseMessage('Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.');
        break;
        case '13':  // if (x === 'value2')
        //code here
        setResponseMessage('Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.');
        break;
        case '24':  // if (x === 'value2')
        //code here
        setResponseMessage('Giao dịch không thành công do: Khách hàng hủy giao dịch');
        break;
        case '51':  // if (x === 'value2')
        //code here
        setResponseMessage('Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.');
        break;
        case '65':  // if (x === 'value2')
        //code here
        setResponseMessage('Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.');
        break;
        case '75':  // if (x === 'value2')
        //code here
        setResponseMessage('Ngân hàng thanh toán đang bảo trì.');
        break;
        case '79':  // if (x === 'value2')
        //code here
        setResponseMessage('Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch');
        break;
        case '99':  // if (x === 'value2')
        //code here
        setResponseMessage('Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)');
        break;
      default:
        //code here
        setResponseMessage('Lỗi không xác định');
        break;
    }
  }, [amount, orderId, payDate, searchParams,responseMessage]);

    return (
        <div className="payment-result-container">
            <div className="payment-header">
                <h2>Kết quả thanh toán</h2>
            </div>
           {  <div className="payment-details">
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
                <div className="detail">
                <label>Noi dung phản hồi:</label>
                <span>{responseMessage}</span>
                </div>
            </div>}
            <div className="actions">
                <button className="btn-continue" onClick={() => window.location.href = '/user/ProductGallery'}>
                    Tiếp tục mua sắm
                </button>
                <button className="btn-home" onClick={() => window.location.href = '/user/index'}>
                    Về trang chủ
                </button>
            </div>
        </div>
    );
};

export default PaymentResult;
