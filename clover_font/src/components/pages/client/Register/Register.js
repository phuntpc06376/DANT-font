import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Card, Alert } from "react-bootstrap";
import axios from "axios"; // To make API requests
import { useNavigate } from "react-router-dom";
import { Input } from "mdb-ui-kit";

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullname, setFullname] = useState("");
    const [gender, setGender] = useState(true);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    

    useEffect(() => {
        // Khởi tạo MDB Input sau khi render
        const inputs = document.querySelectorAll('.form-outline');
        inputs.forEach((input) => {
            new Input(input);
        });
    }, []); // Chỉ chạy 1 lần sau khi render

    // Handle form submission
    const handleRegister = async (e) => {
        e.preventDefault();

        // Chuẩn bị dữ liệu JSON để gửi API
        const requestData = {
            username,
            password,
            fullname,
            gender,
            phone,
            email,
            avatar: null, // Hiện tại BE không xử lý file ảnh avatar
            roleId: 1,    // Giá trị giả định (tùy chỉnh nếu BE cần roleId khác)
        };

        try {
            // Gửi yêu cầu POST tới API
            const response = await axios.post("http://localhost:8080/api/register", requestData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // Kiểm tra phản hồi và xử lý kết quả
            if (response.status === 200 && response.data.status === "success") {
                setSuccess(response.data.message);
                setError(null)
                navigate("/login");
            } else {
                // Hiển thị lỗi từ BE (nếu có)
                setError(response.data.message || "Đăng ký thất bại!");
            }
        } catch (err) {
            // Kiểm tra phản hồi lỗi từ BE
            if (err.response) {
                const errorData = err.response.data;
                if (errorData.errors) {
                    setError(errorData.errors.split(";")[0]); // Hiển thị lỗi đầu tiên
                } else {
                    setError(errorData.message || "Lỗi không xác định từ server.");
                }
            } else {
                // Lỗi không kết nối được server
                setError("Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.");
            }
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <Row className="w-100 justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <Card className="shadow-lg mb-5 bg-white rounded">
                        <Card.Body>
                            <img
                                className="mx-auto d-block"
                                src="https://img.upanh.tv/2024/11/20/Logo4.png"
                                alt="logo"
                                style={{ maxWidth: "100px" }}
                            />
                            <h3 className="text-center mb-5">Đăng ký</h3>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            <Form onSubmit={handleRegister}>
                                {/* Fullname and Username Fields */}
                                <Row>
                                    <Col xs={12} md={6} className="mb-3">
                                        <Form.Group data-mdb-input-init className="form-outline">
                                            <Form.Control
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                                id="inputUsername"
                                                className="form-control"
                                            />
                                            <Form.Label className="form-label" htmlFor="inputUsername" >Tên đăng nhập</Form.Label>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6} className="mb-3">
                                        <Form.Group data-mdb-input-init className="form-outline">
                                            <Form.Control
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                id="inputPassword"
                                                className="form-control"
                                            />
                                            <Form.Label className="form-label" htmlFor="inputPassword" >Mật khẩu</Form.Label>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Fullname and Gender Fields */}
                                <Row>
                                    <Col xs={12} md={6} className="mb-3">
                                        <Form.Group data-mdb-input-init className="form-outline">
                                            <Form.Control
                                                type="text"
                                                value={fullname}
                                                onChange={(e) => setFullname(e.target.value)}
                                                required
                                                id="inputFullname"
                                                className="form-control"
                                            />
                                            <Form.Label className="form-label" htmlFor="inputFullname" >Họ và tên</Form.Label>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6} className="mb-3">
                                        <Form.Group className="mt-1">
                                            <Form.Label className="me-3">Giới tính</Form.Label>
                                            <span>
                                                <Form.Check
                                                    inline
                                                    label="Nam"
                                                    name="gender"
                                                    type="radio"
                                                    value={true}
                                                    checked={gender === true}
                                                    onChange={(e) => setGender(true)}
                                                />
                                                <Form.Check
                                                    inline
                                                    label="Nữ"
                                                    name="gender"
                                                    type="radio"
                                                    value={false}
                                                    checked={gender === false}
                                                    onChange={(e) => setGender(false)}
                                                />
                                            </span>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Phone and Email Fields */}
                                <Row>
                                    <Col xs={12} md={6} className="mb-3">
                                        <Form.Group data-mdb-input-init className="form-outline">
                                            <Form.Control
                                                type="text"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                                id="inputPhone"
                                                className="form-control"
                                            />
                                            <Form.Label className="form-label" htmlFor="inputPhone" >Số điện thoại</Form.Label>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6} className="mb-3">
                                        <Form.Group data-mdb-input-init className="form-outline">
                                            <Form.Control
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                id="inputEmail"
                                                className="form-control"
                                            />
                                            <Form.Label className="form-label" htmlFor="inputEmail">Email</Form.Label>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button className="w-100 mt-3" type="submit">
                                    Đăng ký
                                </Button>

                                <div className="text-center mt-3 mb-3">
                                    <span className="text-muted">Đã có tài khoản? </span>
                                    <a href="/login" className="text-secondary-emphasis text-decoration-none hover-link">
                                        Đăng nhập
                                    </a>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
