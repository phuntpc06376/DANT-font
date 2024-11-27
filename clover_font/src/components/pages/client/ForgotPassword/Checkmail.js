import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "../ForgotPassword/checkmail.css";

export default function CheckEmail() {
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <Row className="w-100 justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <Card className="shadow-lg p-4 bg-white rounded text-center">
                        <img
                            src="https://img.upanh.tv/2024/11/20/Logo4.png"
                            alt="logo"
                            className="mx-auto d-block mb-3"
                            style={{ maxWidth: "80px" }}
                        />
                        <h3 className="mb-4">Kiểm tra email</h3>
                        <p className="text-muted mb-4">
                            Chúng tôi đã gửi một email chứa liên kết để đặt lại mật khẩu của bạn. Vui lòng kiểm tra hộp thư của bạn (bao gồm cả mục thư rác hoặc spam).
                        </p>
                        <Button
                            href="/login"
                            variant="primary"
                            className="w-100 rounded-pill mb-3"
                        >
                            Trở về trang đăng nhập
                        </Button>
                        <Button
                            href="/forgot-password"
                            variant="secondary"
                            className="w-100 rounded-pill"
                        >
                            Thử lại
                        </Button>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
