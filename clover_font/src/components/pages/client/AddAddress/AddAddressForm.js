import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  getProvince,
  getDistrict,
  getWard,
} from "../services/ghnApiService"; // Cần đảm bảo các API đúng định dạng và URL

const AddressManagement = () => {
  const [addresses, setAddresses] = useState({});
  const [province, setProvince] = useState([]);
  const [district, setDistrict] = useState([]);
  const [ward, setWard] = useState([]);
  const [selectedDistrictName, setSelectedDistrictName] = useState(""); // Lưu tên quận

  const [selectedWardName, setSelectedWardName] = useState(""); // Lưu tên quận
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);

  const token = localStorage.getItem("token"); // Lấy token từ localStorage

  // Hàm lấy danh sách tỉnh
  const fetchProvinces = async () => {
    try {
      const response = await getProvince();
      setProvince(response.data);
    } catch (err) {
      console.error("Error fetching provinces:", err.response || err);
    }
  };

  // Lấy danh sách quận/huyện theo tỉnh
  const fetchDistricts = async (provinceId) => {
    if (!provinceId) return; // Không gọi API nếu không có tỉnh được chọn
    try {
      const response = await getDistrict(provinceId);
      setDistrict(response.data);
    } catch (err) {
      console.error("Error fetching districts:", err.response || err);
    }
  };

  // Lấy danh sách phường/xã theo quận/huyện
  const fetchWards = async (districtId) => {
    if (!districtId) return; // Không gọi API nếu không có quận được chọn
    try {
      const response = await getWard(districtId);
      setWard(response.data);
    } catch (err) {
      console.error("Error fetching wards:", err.response || err);
    }
  };

  // Lấy danh sách địa chỉ từ backend
  const fetchAddresses = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/seller/address/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);

      setAddresses(response.data || []);
    } catch (err) {
      console.error("Error fetching addresses:", err.response || err);
    }
  };

  // Xử lý khi thay đổi tỉnh
  const handleProvinceChange = (e) => {
    const selected = e.target.value;

    setSelectedProvince(selected);
    setSelectedDistrict(""); // Xóa quận đã chọn khi tỉnh thay đổi
    setSelectedWard(""); // Xóa xã đã chọn khi tỉnh thay đổi
    setDistrict([]); // Xóa danh sách quận
    setWard([]); // Xóa danh sách xã
    fetchDistricts(selected); // Gọi API lấy quận
  };

  // Xử lý khi thay đổi quận
  const handleDistrictChange = (e) => {
    const selectedDistrictId = e.target.value;
    const selectedDistrictName = e.target.selectedOptions[0].text; // Lấy tên quận

    setSelectedDistrict(selectedDistrictId);
    setSelectedDistrictName(selectedDistrictName); // Lưu tên quận

    setSelectedWard(""); // Xóa xã đã chọn khi quận thay đổi
    setWard([]); // Xóa danh sách xã

    fetchWards(selectedDistrictId); // Gọi API lấy xã
  };

  const handleWardChange = (e) => {
    const selectedWardCode = e.target.value;
    const selectedWardName = e.target.selectedOptions[0].text; // Lấy tên xã

    setSelectedWard(selectedWardCode);
    setSelectedWardName(selectedWardName); // Lưu tên xã
  };

  // Xử lý khi gửi form (thêm hoặc cập nhật)
  // Xử lý khi gửi form (thêm hoặc cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(address);
    console.log(selectedDistrict);
    console.log(selectedWard);
    console.log(selectedDistrictName);
    console.log(selectedWardName);

    // Tạo FormData để gửi dữ liệu dưới dạng form-data
    const formData = new FormData();
    formData.append("address", address);
    formData.append("districtId", selectedDistrict);
    formData.append("wardCode", selectedWard);
    formData.append("districtName", selectedDistrictName);
    formData.append("wardName", selectedWardName);
    // Nếu cập nhật, thêm ID vào FormData
    if (selectedAddress) {
      formData.append("id", selectedAddress.id);
    }

    // Đường dẫn và phương thức HTTP
    const url = selectedAddress
      ? "http://localhost:8080/api/seller/address/updateAddress"
      : "http://localhost:8080/api/seller/address/addAddress";
    const method = selectedAddress ? "put" : "post";

    try {
      const response = await axios({
        url,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Định dạng gửi là form-data
        },
        data: formData, // Gửi FormData
      });

      if (response.data.status) {
        fetchAddresses(); // Reload danh sách địa chỉ
        clearForm();
      } else {
        alert("Thao tác thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi gửi form:", err.response || err);
      alert("Đã xảy ra lỗi!");
    }
  };


  // Xử lý xóa địa chỉ
  const handleDelete = async (id) => {
    try {
      await axios.delete("http://localhost:8080/api/seller/address/deleteAddress", {
        params: { id },
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses();
    } catch (err) {
      console.error("Error deleting address:", err.response || err);
      alert("Error occurred!");
    }
  };

  // Xóa form sau khi thêm hoặc cập nhật
  const clearForm = () => {
    setAddress("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setSelectedAddress(null);
    setDistrict([]);
    setWard([]);
  };

  // Lấy danh sách tỉnh khi load trang
  useEffect(() => {
    fetchProvinces();
    fetchAddresses();
  }, []);

  return (
    <div className="container">
      <h2>Địa chỉ của bạn</h2>
      <form onSubmit={handleSubmit}>
        <input  className="form-control"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Nhập địa chỉ"
          required
        />
        <div className="mb-3">
          <h3>Chọn Tỉnh</h3>
          <select className="form-select" value={selectedProvince} onChange={handleProvinceChange}>
            <option value="">Chọn tỉnh</option>
            {province.map((p) => (
              <option  key={p.ProvinceID} value={p.ProvinceID}>
                {p.ProvinceName}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <h3>Chọn Quận/Huyện</h3>
          <select className="form-select" value={selectedDistrict} onChange={handleDistrictChange} disabled={!district.length}>
            <option value="">Chọn quận/huyện</option>
            {district.map((d) => (
              <option key={d.DistrictID} value={d.DistrictID}>
                {d.DistrictName}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <h3>Chọn Phường/Xã</h3>
          <select className="form-select" value={selectedWard} onChange={handleWardChange} disabled={!ward.length}>
            <option value="">Chọn phường/xã</option>
            {ward.map((w) => (
              <option key={w.WardCode} value={w.WardCode}>
                {w.WardName}
              </option>
            ))}
          </select>

        </div>
        <button className="btn mt-2" type="submit">{selectedAddress ? "Cập nhật" : "Thêm"} địa chỉ</button>
      </form>
      <h3>Danh sách địa chỉ</h3>
      <ul>
        {addresses ? (

          <li key={addresses.id}>
            {addresses.address} - {addresses.districtName} - {addresses.wardName}
            <button className="btn mt-2" onClick={() => handleDelete(addresses.id)}>Xóa</button>
            <button className="btn mt-2" onClick={() => setSelectedAddress(addresses)}>Sửa</button>
          </li>
        )
          : (
            <li>Chưa có địa chỉ nào</li>
          )}
      </ul>
    </div>
  );
};

export default AddressManagement;
