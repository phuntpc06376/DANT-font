import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import SelectReact from "./SelectReact"; // Import component select (hoặc react-select)
import { getProvince, getDistrict, getWard } from "./ghnService"; // Import API services
import axios from "axios";

const ShopRegistration = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        districtName: '',
        districtId: '',
        wardCode: '',
        wardName: '',
        phone: ''
    });

    const [provinceOptions, setProvinceOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [wardOptions, setWardOptions] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    // Lấy danh sách tỉnh/thành phố
    const fetchProvinces = async () => {
        try {
            const response = await getProvince();
            // Kiểm tra nếu dữ liệu trả về có trường "data" là mảng
            if (Array.isArray(response.data)) {
                setProvinceOptions(response.data.map((p) => ({
                    value: p.ProvinceID,
                    label: p.ProvinceName
                })));
            } else {
                console.error("Dữ liệu không phải là mảng:", response);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách tỉnh/thành phố!");
            console.error("Error fetching provinces:", error);
        }
    };



    // Lấy danh sách quận/huyện dựa trên tỉnh
    const fetchDistricts = async (provinceId) => {
        if (!provinceId) return;
        try {
            const response = await getDistrict(provinceId);
            // Kiểm tra nếu dữ liệu trả về có trường "data" là mảng
            if (Array.isArray(response.data)) {
                setDistrictOptions(
                    response.data.map((d) => ({
                        value: d.DistrictID,
                        label: d.DistrictName
                    }))
                );
            } else {
                console.error("Dữ liệu không phải là mảng:", response);
            }
        } catch (error) {
            console.error("Error fetching districts:", error);
        }
    };


    // Lấy danh sách phường/xã dựa trên quận/huyện
    const fetchWards = async (districtId) => {
        if (!districtId) return;
        try {
            const response = await getWard(districtId);
            // Kiểm tra nếu dữ liệu trả về có trường "data" là mảng
            if (Array.isArray(response.data)) {
                setWardOptions(
                    response.data.map((w) => ({
                        value: w.WardCode,
                        label: w.WardName
                    }))
                );
            } else {
                console.error("Dữ liệu không phải là mảng:", response);
            }
        } catch (error) {
            console.error("Error fetching wards:", error);
        }
    };

    useEffect(() => {
        fetchProvinces();
    }, []);



    const handleProvinceChange = (selectedOption) => {
        setSelectedProvince(selectedOption);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistrictOptions([]);
        setWardOptions([]);
        setFormData({
            ...formData,
            districtName: '',
            districtId: '',
            wardCode: '',
            wardName: ''
        });

        if (selectedOption) {
            fetchDistricts(selectedOption.value);
        }
    };

    const handleDistrictChange = (selectedOption) => {
        setSelectedDistrict(selectedOption);
        setSelectedWard(null);
        setWardOptions([]);
        if (selectedOption) {
            fetchWards(selectedOption.value);
            setFormData({ ...formData, wardCode: '', wardName: '', districtId: selectedOption.value, districtName: selectedOption.label });
        }
    };

    const handleWardChange = (selectedOption) => {
        setSelectedWard(selectedOption);
        if (selectedOption) {
            setFormData({ ...formData, wardCode: selectedOption.value, wardName: selectedOption.label });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isInvalid = Object.values(formData).some((field) => {
            return typeof field === 'string' && !field.trim(); // Kiểm tra chỉ với chuỗi
        });

        if (isInvalid) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        console.log("Dữ liệu gửi đi:", formData); // Thêm log ở đây để kiểm tra dữ liệu gửi đi

        try {
            const formDataObject = new FormData();

            Object.keys(formData).forEach((key) => {
                formDataObject.append(key, formData[key]);
            });

// Kiểm tra kết quả
            for (let pair of formDataObject.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }
            const response = await axios.post(
                "http://localhost:8080/api/shop/create", // Đảm bảo URL chính xác
                formDataObject,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}` // Token cần phải có
                    }
                }
            );
            toast.success("Đăng ký cửa hàng thành công!");
        } catch (error) {
            toast.error("Đã có lỗi xảy ra khi tạo cửa hàng!");
            console.error("Error creating shop:", error);
        }
    };

    return (
        <Container>
            <ToastContainer />
            <h2 className="mt-5">Đăng ký cửa hàng</h2>
            <Form onSubmit={handleSubmit} className="mt-4">
                <Row>
                    <Col sm={12} md={6}>
                        <Form.Group controlId="formName">
                            <Form.Label>Tên cửa hàng</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên cửa hàng"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col sm={12} md={6}>
                        <Form.Group controlId="formPhone">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập số điện thoại"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group controlId="formAddress">
                    <Form.Label>Địa chỉ</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nhập địa chỉ cụ thể"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                <Row>
                    <Col sm={12} md={4}>
                        <Form.Label>Tỉnh/Thành phố</Form.Label>
                        <SelectReact
                            options={provinceOptions}
                            value={selectedProvince}
                            onChange={handleProvinceChange}
                            placeholder="Chọn tỉnh/thành phố"
                        />
                    </Col>
                    <Col sm={12} md={4}>
                        <Form.Label>Quận/Huyện</Form.Label>
                        <SelectReact
                            options={districtOptions}
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                            placeholder="Chọn quận/huyện"
                            isDisabled={!districtOptions.length}
                        />
                    </Col>
                    <Col sm={12} md={4}>
                        <Form.Label>Phường/Xã</Form.Label>
                        <SelectReact
                            options={wardOptions}
                            value={selectedWard}
                            onChange={handleWardChange}
                            placeholder="Chọn phường/xã"
                            isDisabled={!wardOptions.length}
                        />
                    </Col>
                </Row>

                <Button
                    variant="primary"
                    type="submit"
                    className="mt-3"
                    disabled={Object.values(formData).some((field) => !field)}
                >
                    Đăng ký cửa hàng
                </Button>

            </Form>
        </Container>
    );
};

export default ShopRegistration;
