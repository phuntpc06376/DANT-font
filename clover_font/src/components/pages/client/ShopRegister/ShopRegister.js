import React, { useState } from "react";
import { Container, Form, Button, Col, Row } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(formData).some((field) => !field.trim())) {
            toast.error('Vui lòng điền đầy đủ thông tin!');
            return;
        }
    
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Bạn chưa đăng nhập!');
            return;
        }
    
        try {
            // Tạo FormData và thêm các giá trị
            const formBody = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                formBody.append(key, value);
            });
    
            const response = await fetch('http://localhost:8080/api/shop/create', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`, // Không thêm Content-Type, FormData tự xử lý
                },
                body: formBody, // Gửi FormData thay vì JSON
            });
    
            const result = await response.json();
            if (response.ok) {
                toast.success('Shop đã được tạo thành công!');
                setFormData({
                    name: '',
                    address: '',
                    districtName: '',
                    districtId: '',
                    wardCode: '',
                    wardName: '',
                    phone: ''
                });
                console.log(setFormData);
                
            } else {
                throw new Error(result.message || 'Lỗi không xác định');
            }
        } catch (err) {
            toast.error('Lỗi khi tạo shop: ' + err.message);
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

                <Row>
                    <Col sm={12} md={6}>
                        <Form.Group controlId="formAddress">
                            <Form.Label>Địa chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập địa chỉ"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col sm={12} md={6}>
                        <Form.Group controlId="formDistrictName">
                            <Form.Label>Tên quận</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ví dụ: Quận 1"
                                name="districtName"
                                value={formData.districtName}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col sm={12} md={6}>
                        <Form.Group controlId="formDistrictId">
                            <Form.Label>Mã quận</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập mã quận"
                                name="districtId"
                                value={formData.districtId}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col sm={12} md={6}>
                        <Form.Group controlId="formWardCode">
                            <Form.Label>Mã phường</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập mã phường"
                                name="wardCode"
                                value={formData.wardCode}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col sm={12} md={6}>
                        <Form.Group controlId="formWardName">
                            <Form.Label>Tên phường</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên phường"
                                name="wardName"
                                value={formData.wardName}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Button variant="primary" type="submit" className="mt-3">
                    Đăng ký cửa hàng
                </Button>
            </Form>
        </Container>
    );
};

export default ShopRegistration;
