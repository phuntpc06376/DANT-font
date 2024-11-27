import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Card, Alert } from "react-bootstrap";
import axios from "axios";
import { Input } from "mdb-ui-kit";
import "../ForgotPassword/forgot.css";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState(""); // Mã xác nhận
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isCodeSent, setIsCodeSent] = useState(false); // Theo dõi trạng thái mã đã gửi
    const [isCodeVerified, setIsCodeVerified] = useState(false); // Theo dõi trạng thái xác nhận mã
    const navigate = useNavigate();

    useEffect(() => {
        // Khởi tạo MDB Input sau khi render
        const inputs = document.querySelectorAll('.form-outline');
        inputs.forEach((input) => {
            new Input(input);
        });
    }, []); // Chỉ chạy 1 lần sau khi render

    // Gửi mã xác nhận qua email
    const handleSendCode = async (e) => {
        e.preventDefault();
        if (email.trim() === "") {
            setError("Email không thể để trống.");
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8080/account/forgot/${email}`);

            // Kiểm tra trạng thái của phản hồi và hiển thị thông báo
            if (response.data.status === "success") {
                setSuccess(response.data.message);
                setIsCodeSent(true);
                setError(null);
            } else {
                setError(response.data.message);  // Lấy thông báo lỗi từ backend
                setSuccess(null);
            }
        } catch (err) {
            if (err.response) {
                // Lỗi từ backend, sẽ có mã và message
                setError(err.response.data.message || "Không tìm thấy email.");
            } else {
                setError("Lỗi hệ thống. Vui lòng thử lại.");

            }

            setSuccess(null);
        }
    };

    // Xác minh mã xác nhận
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (code.trim() === "") {
            setError("Mã xác nhận không thể để trống.");
            return;
        }

        try {
            // Gửi yêu cầu xác minh mã
            const response = await axios.get(`http://localhost:8080/account/forgot/${email}/${code}`);

            if (response.data.status === "success") {
                setSuccess(response.data.message);
                setIsCodeVerified(true);
                setError(null);
                navigate('/check-email');
            } else {
                setError(response.data.message);  // Lấy thông báo lỗi từ backend
                setSuccess(null);
            }
        } catch (err) {
            // Kiểm tra xem backend có trả về phản hồi lỗi trong `err.response` không
            if (err.response && err.response.data) {
                setError(err.response.data.message); // Thông báo lỗi từ backend
            } else {
                setError("Lỗi hệ thống. Vui lòng thử lại."); // Lỗi không xác định (hệ thống)
            }
            setSuccess(null);
        }
    };


    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <Row className="w-100 justify-content-center">
                <Col xs={12} md={6} lg={5}>
                    <Card className="shadow-lg mb-5 bg-white rounded">
                        <Card.Body>
                            <img
                                className="mx-auto d-block"
                                src="https://img.upanh.tv/2024/11/20/Logo4.png"
                                alt="logo"
                                style={{ maxWidth: "100px" }}
                            />
                            <h3 className="text-center mb-4">Quên mật khẩu</h3>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            <Form>
                                {/* Email Field */}
                                <Form.Group id="email" data-mdb-input-init className="form-outline mb-3">
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isCodeSent || isCodeVerified} // Không cho phép thay đổi email nếu đã gửi mã hoặc đã xác nhận mã
                                        className="form-control form-control-lg"
                                        id="inputEmail"
                                    />
                                    <Form.Label className="form-label" htmlFor="inputEmail">Email</Form.Label>
                                </Form.Group>

                                {/* Code Field with Send Button */}
                                {!isCodeVerified && (
                                    <Form.Group className="form-group-horizontal">
                                        <div className="form-outline" data-mdb-input-init>
                                            <Form.Control
                                                type="text"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                id="inputConfirmation"
                                                disabled={!isCodeSent}
                                                className="form-control form-control-lg"
                                            />
                                            <Form.Label className="form-label" htmlFor="inputConfirmation">Mã xác nhận</Form.Label>
                                        </div>
                                        <Button
                                            onClick={handleSendCode}
                                            variant="primary"
                                        >
                                            Gửi mã
                                        </Button>
                                    </Form.Group>
                                )}
                            </Form>
                            <div className="text-center mt-4">
                                <Button
                                    onClick={handleVerifyCode}
                                    disabled={!isCodeSent}
                                    variant="secondary"
                                    className="w-100 rounded-pill"
                                >
                                    Xác nhận
                                </Button>
                            </div>
                            <div className="text-center mt-3">
                                <a href="/login" className="text-secondary-emphasis text-decoration-none hover-link">
                                    Trở lại trang đăng nhập
                                </a>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
