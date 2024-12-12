import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import {
  getProvince,
  getDistrict,
  getWard,
} from "../services/ghnApiService"; // Đảm bảo các API đúng định dạng và URL
import "./AddAddressForm.css";
const AddressManagement = () => {
  const [addresses, setAddresses] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [idUpdate, setIdUpdate] = useState(null)
  const token = localStorage.getItem("token"); // Lấy token từ localStorage

  // Lấy danh sách tỉnh
  const fetchProvinces = async () => {
    try {
      const response = await getProvince();
      console.log("Provinces:", response.data); // Kiểm tra dữ liệu trả về
      setProvinceOptions(
        response.data.map((p) => ({
          value: p.ProvinceID,
          label: p.ProvinceName,
        }))
      );
    } catch (err) {
      console.error("Error fetching provinces:", err.response || err);
    }
  };

  // Lấy danh sách quận/huyện
  const fetchDistricts = async (provinceId) => {
    if (!provinceId) return;
    try {
      const response = await getDistrict(provinceId);
      console.log("Districts:", response.data); // Kiểm tra dữ liệu trả về
      setDistrictOptions(
        response.data.map((d) => ({
          value: d.DistrictID,
          label: d.DistrictName,
        }))
      );
    } catch (err) {
      console.error("Error fetching districts:", err.response || err);
    }
  };

  // Lấy danh sách phường/xã
  const fetchWards = async (districtId) => {
    if (!districtId) return;
    try {
      const response = await getWard(districtId);
      console.log("Wards:", response.data); // Kiểm tra dữ liệu trả về
      setWardOptions(
        response.data.map((w) => ({
          value: w.WardCode,
          label: w.WardName,
        }))
      );
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
      console.log("API response:", response.data); // Kiểm tra dữ liệu trả về

      const addressList = Array.isArray(response.data) ? response.data : [response.data];
      setAddresses(addressList); // Cập nhật state
    } catch (err) {
      console.error("Error fetching addresses:", err.response || err);
      setAddresses([]); // Đảm bảo state là mảng rỗng nếu lỗi
    }
  };

  // Xử lý khi chọn tỉnh
  const handleProvinceChange = (selectedOption) => {
    setSelectedProvince(selectedOption);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistrictOptions([]);
    setWardOptions([]);
    if (selectedOption) fetchDistricts(selectedOption.value);
  };

  // Xử lý khi chọn quận/huyện
  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption);
    setSelectedWard(null);
    setWardOptions([]);
    if (selectedOption) fetchWards(selectedOption.value);
  };

  // Xử lý khi chọn phường/xã
  const handleWardChange = (selectedOption) => {
    setSelectedWard(selectedOption);
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra các trường bắt buộc không được bỏ trống
    if (!address || !selectedDistrict || !selectedWard || !selectedProvince) {
      alert("Vui lòng nhập đầy đủ thông tin địa chỉ!");
      return;
    }

    // Lấy giá trị districtId, wardCode, wardName và districtName
    const id = idUpdate;
    const districtId = selectedDistrict ? parseInt(selectedDistrict.value, 10) : null;
    const wardCode = selectedWard ? selectedWard.value : null;
    const wardName = selectedWard ? selectedWard.label : null;
    const districtName = selectedDistrict ? selectedDistrict.label : null;

    // Kiểm tra nếu có bất kỳ trường nào thiếu dữ liệu
    if (!districtId || !wardCode || !wardName || !districtName || !address) {
      alert("Vui lòng cung cấp đầy đủ thông tin.");
      return;
    }

    // Xử lý dữ liệu
    const data = {
      id,
      address, // Địa chỉ không được để trống
      districtId, // districtId phải là Integer
      wardCode, // wardCode phải là String
      districtName, // districtName là tên của quận
      wardName, // wardName là tên của phường
    };

    // Thêm id nếu có
    if (selectedAddress) {
      data.id = selectedAddress.id;
    }
    const formData = new FormData();
    if (data.id) {
      formData.append("id", data.id);
    }


    formData.append("address", data.address);
    formData.append("districtName", data.districtName);
    formData.append("districtId", data.districtId);
    formData.append("wardCode", data.wardCode);
    formData.append("wardName", data.wardName);

    // Đặt URL và phương thức API
    const url = selectedAddress
      ? "http://localhost:8080/api/seller/address/updateAddress"
      : "http://localhost:8080/api/seller/address/addAddress";
    const method = selectedAddress ? "put" : "post";

    try {
      console.log(data);

      const response = await axios({
        url,
        method,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        }

      });

      console.log("API response after submit:", response.data);
      if (response.data.status) {
        fetchAddresses();
        clearForm();
      } else {
        alert("Thao tác thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi gửi form:", err.response || err);
      if (err.response && err.response.data) {
        alert("Lỗi: " + err.response.data.message); // In ra thông báo lỗi từ server
      } else {
        alert("Đã xảy ra lỗi!");
      }
    }
  };
  const handleSelectAddress = (addr) => {
    console.log(addr);

    setSelectedAddress(addr); // Cập nhật selectedAddress
    // Cập nhật các trường trong form với giá trị từ selectedAddress
    setAddress(addr.address);
    setSelectedDistrict({
      value: addr.districtId,
      label: addr.districtName,
    });
    setSelectedWard({
      value: addr.wardCode,
      label: addr.wardName,
    });
    // Cập nhật các trường khác nếu có
  };

  const clearForm = () => {
    setAddress("");
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setSelectedAddress(null);
  };

  useEffect(() => {
    fetchProvinces();
    fetchAddresses();
  }, []);

  return (
    <div className="address-management">
  <h2>Quản lý địa chỉ</h2>
  <form onSubmit={handleSubmit}>
    <input
      className="form-control"
      type="text"
      value={address}
      onChange={(e) => setAddress(e.target.value)}
      placeholder="Nhập địa chỉ"
      required
    />
    <div className="select-container">
      <h3>Chọn Tỉnh</h3>
      <Select
        options={provinceOptions}
        value={selectedProvince}
        onChange={handleProvinceChange}
        placeholder="Chọn tỉnh"
      />
    </div>
    <div className="select-container">
      <h3>Chọn Quận/Huyện</h3>
      <Select
        options={districtOptions}
        value={selectedDistrict}
        onChange={handleDistrictChange}
        placeholder="Chọn quận/huyện"
        isDisabled={!districtOptions.length}
      />
    </div>
    <div className="select-container">
      <h3>Chọn Phường/Xã</h3>
      <Select
        options={wardOptions}
        value={selectedWard}
        onChange={handleWardChange}
        placeholder="Chọn phường/xã"
        isDisabled={!wardOptions.length}
      />
    </div>
    <button className="btn btn-primary" type="submit">
      {selectedAddress ? "Cập nhật" : "Thêm"} địa chỉ
    </button>
  </form>
  <h3>Danh sách địa chỉ</h3>
  <div className="address-list">
    <ul>
      {Array.isArray(addresses) && addresses.length > 0 ? (
        addresses.map((addr) => (
          <li key={addr.id}>
            {addr.address} - {addr.districtName} - {addr.wardName}
            <button
              className="btn btn-warning"
              onClick={() => handleSelectAddress(addr)}
            >
              Sửa
            </button>
          </li>
        ))
      ) : (
        <li>Chưa có địa chỉ nào</li>
      )}
    </ul>
  </div>
</div>

  );
};

export default AddressManagement;
