import React, { useState, useEffect } from "react";
import {
  getAccountByUsername,
  postCheckPoint,
} from "../services/account_service";
import {
  getOrderFromCart,
  addCartToBill,
  payment,
  setBillAsPaid,
  updateBillOrderId
} from "../services/order_servide";
import {  
  createOrder
  , getProvince
  , getDistrict
  , getWard
} from "../services/ghnApiService";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const Order = () => {
  const navigate = useNavigate();
  const ids = localStorage.getItem("ids");
  const token = localStorage.getItem("token"); // Lấy token từ localStorage
  // State chính cho `order`
  // const [order, setOrder] = useState({
  //   payment_type_id: null,
  //   // note: "",
  //   required_note: "",
  //   // from_name: "",
  //   // from_phone: "",
  //   // from_address: "",
  //   // from_ward_name: "",
  //   // from_district_name: "",
  //   // from_province_name: "",
  //   // return_phone: "",
  //   // return_address: "",
  //   // return_district_id: null,
  //   // return_ward_code: "",
  //   // client_order_code: "",
  //   to_name: "",
  //   to_phone: "",
  //   to_address: "",
  //   to_ward_code: "",
  //   to_district_id: null,
  //   // content: "",
  //   weight: null,
  //   length: null,
  //   width: null,
  //   height: null,
  //   // pick_station_id: null,
  //   deliver_station_id: null,
  //   // insurance_value: null,
  //   service_type_id: null,
  //   // coupon: null,
  //   // pick_shift: [],
  //   items: [],
  // });

  // // State cho danh sách item
  // const [items, setItems] = useState([]);

  // // State cho danh sách category
  // const [categories, setCategories] = useState([]);

  const [accounts, setAccounts] = useState({});
  const [cartPay, setCartPay] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const [usePoint, setUsePoint] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [payMent, setPayMent] = useState(0);
 const [province, setProvince] = useState([]);
 const [distrinct, setDistrict] = useState([]);
 const [ward, setWard] = useState([]);
  useEffect(() => {
    if (!ids) {
      navigate("/");
      return;
    }

    // const parsedIds = JSON.parse(ids); // Chuyển đổi chuỗi JSON thành mảng
    const fetchUserData = async () => {
      try {
        // Lấy thông tin tài khoản từ API thông qua token
        const userData = await getAccountByUsername();

        console.log(userData);
        setAccounts(userData); // Lưu thông tin tài khoản vào state

        const cart = await getOrderFromCart(ids);
        console.log(cart);

        setCartPay(cart);
        const provinces = await getProvince();
        
        setProvince(provinces.data);
        console.log(province);
        
        // const total = cart.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
        // setTotalPrice(total);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchUserData();
  }, [token, ids, navigate]);

  useEffect(() => {
    const handlePaymentResponse = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.has("vnp_ResponseCode") &&
        urlParams.get("vnp_ResponseCode") === "00" &&
        localStorage.getItem("IdPayment")
      ) {
        try {
          await setBillAsPaid(localStorage.getItem("IdPayment"));
          toast.success("Thanh toán hóa đơn thành công!");
          localStorage.removeItem("IdPayment");
          navigate("/bills");
        } catch (error) {
          toast.error("Xử lý hóa đơn thất bại!");
        }
      }
    };

    handlePaymentResponse();
  }, [cartPay, inputValue, token]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleInputChange = (event) => setInputValue(event.target.value);
  useEffect(() => {
    // Tính tổng giá trị giỏ hàng
    const total = cartPay.reduce((sum, item) => sum + (item.prod.price * item.quantity), 0);
    setTotalPrice(total);
  }, [cartPay]); // Tính toán lại khi `cartPay` thay đổi
  
  const handleInput = async (event) => {
    event.preventDefault();

    try {
      const check = await postCheckPoint(inputValue, token); // Dùng token làm parameter
      if (!check) {
        toast.error("Số điểm có giá trị tối đa 10% số điểm bạn có!");
      } else {
        const discountAmount = inputValue * 100;
        setTotalPrice((prevPrice) => prevPrice - discountAmount);
        toggleVisibility();
        setUsePoint(true);
      }
    } catch (error) {
      console.error("Error applying points:", error);
    }
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    const shopID = null;
    const formdata = new FormData();
    formdata.append("shipMoney", 0);
    formdata.append("paymentMethods", "new");
    formdata.append("voucher", 4);
    formdata.append("toAddress",  accounts.addresses.address);
    formdata.append("toDistrictId",  accounts.addresses.districtId);
    formdata.append("toWardCode", accounts.addresses.wardCode);
    formdata.append("toDistrictName", accounts.addresses.districtName);
    formdata.append("toWardName", accounts.addresses.wardName);
    
    cartPay.forEach((item) => {
      console.log("item: " + item.id);
   
    //   shopID = item.prod.shop.id
      formdata.append("list", JSON.stringify(item.id));

    });
    console.log(payMent);
    let bill = []; // Sửa `const` thành `let` để có thể gán lại giá trị.
    let totalPriceToPay = 0; 
    try {
      if (parseInt(payMent) === 0) {
        if (formdata.has("status")) {
          formdata.delete("status"); // Xóa nếu key tồn tại
      }
      formdata.append("status", "1"); // Thêm lại giá trị mới
        console.log("COD");
        bill = await addCartToBill(formdata); // Dùng token
        toast.success("Tạo hóa đơn thành công!");
        // navigate("/bills");
      } else if (parseInt(payMent) === 1) {
        if (parseInt(payMent) === 0) {
          if (formdata.has("status")) {
            formdata.delete("status"); // Xóa nếu key tồn tại
        }
      }
        formdata.append("status", "5"); // Thêm lại giá trị mới
        // Tạo hóa đơn
        // Duyệt qua tất cả các cặp key-value trong FormData
        for (let [key, value] of formdata.entries()) {
          console.log(`${key}: ${value}`);
        }
        
        
        bill = await addCartToBill(formdata); // Dùng token
        console.log("Bill:", bill);
        for (const item of bill) {
          const updatedOrder = {
            items: item.detailBills.map((itemDetail) => ({
              name: itemDetail.prod.name,
              quantity: itemDetail.quantity,
              price: itemDetail.prod.price,
              length: 12,
              width: 12,
              weight: 12,
              height: 12,
            })),
            to_name: accounts.fullname,
            to_phone: accounts.phone,
            to_address: accounts.addresses.address,
            to_ward_code: accounts.addresses.wardCode,
            to_district_id: accounts.addresses.districtId,
            payment_type_id: 2,
            required_note: "CHOXEMHANGKHONGTHU",
            deliver_station_id: null,
            height: 10,
            length: 1,
            service_type_id: 5,
            weight: 200,
            width: 19,
          };
        
          console.log("Order:", item.id);
        
          try {
            // Gửi đơn hàng tới GHN
            console.log(item.detailBills[0].prod);
            
            const ghnResponse = await createOrder(item.detailBills[0].prod.shop.shopGhnId, updatedOrder);
            console.log("GHN Response:", ghnResponse);
            // Cập nhật order ngay trong hàm
            const formOrder = new FormData();
            formOrder.append("billId", item.id);
            formOrder.append("orderId", ghnResponse.data.order_code);
            for (let [key, value] of formOrder.entries()) {
              console.log(`${key}: ${value}`);
            }
            const updateBillGhn  = await updateBillOrderId(formOrder);
            console.log(updateBillGhn);
            
            if (ghnResponse.status === 400) {
              console.error("Lỗi từ GHN:", ghnResponse.data);
            }
          } catch (err) {
            console.error("Lỗi khi tạo đơn hàng GHN:", err);
          }
        }
        let billIds = '';
        bill.forEach( (item, index) => {
          if(index === 0) {
              billIds = item.id;
          } else {
              billIds += '-'+item.id;
          }
          item.detailBills.forEach( (item, index) => {
            totalPriceToPay +=  item.price *item.quantity;//cần xác đinh discuont
          })
        })
        // Thanh toán qua VNPay
        console.log('total price: '+totalPriceToPay);
        
        const payUrl = await payment(totalPriceToPay, billIds);
        console.log("Payment URL:", payUrl);
    
        if (payUrl?.data?.paymentUrl) {
          // Chuyển hướng đến trang thanh toán VNPay
          // window.location.href = payUrl.data.paymentUrl;
          // Lưu thông tin hóa đơn thanh toán
          localStorage.setItem("IdPayment", bill);
        } else {
          throw new Error("Không thể lấy URL thanh toán.");
        }
    
        toast.success("Tạo hóa đơn thành công!");

        
        
 // Cập nhật order ngay trong hàm

      }
    } catch (error) {
      console.error("Lỗi trong quá trình tạo hóa đơn hoặc thanh toán:", error);
      toast.error("Đã xảy ra lỗi trong quá trình xử lý!");
    }
    
  };
  
  /*GHN*/ 
  // privince GHN
  const [selectedProvince, setSelectedProvince] = useState(''); // Dùng để lưu tỉnh đã chọn

  const handleChange = (event) => {
    
    setSelectedProvince(event.target.value); // Cập nhật tỉnh được chọn
    console.log(selectedProvince);
    
};
// district GHN
 
  const [selectedDistrict, setSelectedDistrict] = useState(''); // Dùng để lưu quận đã chọn

  const handleChangeDistrict = (event) => {
    console.log(selectedDistrict);
    setSelectedDistrict(event.target.value); // Cập nhật quận được chọn
  };
  // ward GHN
  const [selectedWard, setSelectedWard] = useState(''); // Dùng để lưu phư��ng đã chọn
  const handleChangeWard = (event) => {
    console.log(selectedWard);
    setSelectedWard(event.target.value); // Cập nhật phư��ng được chọn
  };

  useEffect(() => {
    console.log("Selected Province:", selectedProvince);
    if (selectedProvince) {
      const getDistrictGHN = async () => {
        const district = await getDistrict(selectedProvince);
        setDistrict(district.data)
        console.log(district.data);
        
    } 
    // Gọi hàm lấy quận/huyện khi selectedProvince thay đổi
    getDistrictGHN();
    if (selectedDistrict) {
      const getWardGHN = async () => {
        const ward = await getWard(selectedDistrict);
        setWard(ward.data)
        console.log(ward.data);
      };
      getWardGHN();
    }
    }
   
}, [selectedDistrict, selectedProvince]); // Chỉ theo dõi selectedProvince thay đổi

  return (
<div className="App">
  <div className="container-fluid py-5">
    <div className="container py-5">
      <h1 className="mb-4 text-center">Chi tiết thanh toán</h1>
      <form noValidate>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="table-responsive">
              <table className="table text-center align-middle">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {cartPay.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <img
                          className="img-fluid rounded"
                          src={`../image/${p?.prod[0]?.productImages[0]?.name}`}
                          alt=""
                          style={{ width: "80px", height: "80px" }}
                        />
                      </td>
                      <td>{p.prod?.name}</td>
                      <td>
                        {p.prod?.price?.toLocaleString("vi", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </td>
                      <td>{p.quantity}</td>
                      <td>
                        {(p.prod.price * p.quantity)?.toLocaleString("vi", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </td>
                    </tr>
                  ))}

                  <tr className="address-row">
                    <td colSpan="2"><strong>Địa chỉ:</strong></td>
                    <td colSpan="3" className="text-center">
                      {accounts.addresses ? (
                        <p className="mb-0">
                          {accounts.addresses.address}, {accounts.addresses.wardName},{" "}
                          {accounts.addresses.districtName}
                        </p>
                      ) : (
                        <p>Không có thông tin địa chỉ</p>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2"><strong>Phương thức thanh toán:</strong></td>
                    <td colSpan="3">
                      <select
                        name="selectedPayment"
                        className="form-select"
                        onChange={(e) => setPayMent(e.target.value)}
                      >
                        <option value="0">Thanh toán khi nhận hàng</option>
                        <option value="1">Thanh toán qua VNpay</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2"><strong>Tổng:</strong></td>
                    <td colSpan="3">
                      <strong>
                        {totalPrice?.toLocaleString("vi", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
              {/* <div>
            <h2>Chọn tỉnh</h2>
            <select 
                value={selectedProvince} 
                onChange={handleChange} 
                className="form-select"
            >
                <option value="">Chọn tỉnh</option>
                {province.map((province) => (
                    <option key={province.ProvinceID} value={province.ProvinceID}>
                        {province.ProvinceName} 
                    </option>
                ))}
            </select>
            {selectedProvince && <div>Đã chọn tỉnh: {selectedProvince}</div>}
        </div>
        <div>
        <h2>Chọn Quận/Huyện</h2>
            <select 
                value={selectedDistrict} 
                onChange={handleChangeDistrict} 
                className="form-select"
            >
                <option value="">Chọn Quận/Huyện</option>
                {distrinct.map((province) => (
                    <option key={province.DistrictID} value={province.DistrictID}>
                        {province.DistrictName} 
                    </option>
                ))}
            </select>
            {selectedDistrict && <div>Đã chọn Quận/Huyện: {selectedDistrict}</div>}
        </div>
        <div>
        <h2>Chọn Phường/Xã</h2>
            <select 
                value={selectedWard} 
                onChange={handleChangeWard} 
                className="form-select"
            >
                <option value="">Chọn Phường/Xã</option>
                {ward.map((province) => (
                    <option key={province.WardCode} value={province.WardCode}>
                        {province.WardName} 
                    </option>
                ))}
            </select>
            {selectedDistrict && <div>Đã chọn Phường/Xã: {selectedDistrict}</div>}
        </div> */}
            </div>
            <button
              onClick={handlePayment}
              className="btn btn-primary w-100 mt-4"
            >
              Đặt hàng
            </button>
            <Toaster />
          </div>
        </div>
      </form>
    </div>
  </div>
</div>

  );
};

export default Order;
