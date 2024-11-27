import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Card, Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../ForgotPassword/resetPass.css";
import { Input } from "mdb-ui-kit";

export default function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token"); // Lấy token từ URL query string

    useEffect(() => {
        // Khởi tạo MDB Input sau khi render
        const inputs = document.querySelectorAll('.form-outline');
        inputs.forEach((input) => {
            new Input(input);
        });
    }, []); // Chỉ chạy 1 lần sau khi render

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            // Gọi API tới BE để đổi mật khẩu với token trong URL
            const response = await axios.put(`http://localhost:8080/account/changeFogotPass/resetpass/${token}`, // Token từ URL query string
                {
                    newPassword,
                    confirPassword: confirmPassword, // Tham số trùng với backend
                }
            );

            // Xử lý phản hồi từ BE
            if (response.data.status === "success") {
                setSuccess(response.data.message);
                setError(null);
                navigate('/login');
            } else if (response.data.errors) {
                // Tách chuỗi lỗi tại dấu ',' và chỉ hiển thị lỗi đầu tiên
                const firstError = response.data.errors.split(';')[0];
                setError(firstError); // Hiển thị lỗi đầu tiên
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            // Kiểm tra lỗi từ phản hồi nếu có
            if (err.response) {
                // Kiểm tra nếu có lỗi phản hồi từ server
                if (err.response.data && err.response.data.errors) {
                    // Nếu BE trả về các lỗi (errors)
                    const firstError = err.response.data.errors.split(';')[0];
                    setError(firstError);
                } else if (err.response.data && err.response.data.message) {
                    // Nếu BE trả về thông báo lỗi (message)
                    setError(err.response.data.message); // Hiển thị thông báo lỗi chung từ BE
                } else {
                    setError("Lỗi hệ thống. Vui lòng thử lại."); // Lỗi chung từ hệ thống
                }
            } else if (err.request) {
                // Nếu không nhận được phản hồi (chưa kết nối được server)
                setError("Không thể kết nối tới server. Vui lòng kiểm tra kết nối của bạn.");
            } else {
                // Xử lý lỗi khác
                setError("Có lỗi xảy ra. Vui lòng thử lại.");
            }
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
                            <h3 className="text-center mb-4">Đổi mật khẩu</h3>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            <Form onSubmit={handleResetPassword}>
                                {/* New Password Field */}
                                <Form.Group id="newPassword" data-mdb-input-init className="form-outline mb-4">
                                    <Form.Control
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="form-control form-control-lg"
                                        id="inputNewPassword"
                                    />
                                    <Form.Label className="form-label" htmlFor="inputNewPassword">Mật khẩu mới</Form.Label>
                                </Form.Group>

                                {/* Confirm Password Field */}
                                <Form.Group id="confirmPassword" data-mdb-input-init className="form-outline mb-4">
                                    <Form.Control
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="form-control form-control-lg"
                                        id="inputConfirmPassword"
                                    />
                                    <Form.Label className="form-label" htmlFor="inputConfirmPassword">Xác nhận mật khẩu</Form.Label>
                                </Form.Group>

                                {/* Submit Button */}
                                <Button
                                    className="w-100 rounded-pill mb-3"
                                    type="submit"
                                    variant="primary"
                                >
                                    Đổi mật khẩu
                                </Button>
                            </Form>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
