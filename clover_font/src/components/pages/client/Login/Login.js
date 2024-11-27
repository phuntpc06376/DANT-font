import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Card, Alert } from "react-bootstrap";
import { Input } from "mdb-ui-kit";
import "../Login/login.css"

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Khởi tạo MDB Input sau khi render
    const inputs = document.querySelectorAll('.form-outline');
    inputs.forEach((input) => {
      new Input(input);
    });
  }, []); // Chỉ chạy 1 lần sau khi render

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Gửi yêu cầu đăng nhập đến API
      const response = await axios.get("http://localhost:8080/api/login",{
        params: {
          username,
          password,
        },
      });
      
      // Kiểm tra phản hồi
      if (response.status === 200 && response.data.status === "success") {
        localStorage.setItem("token", response.data.data); // Lưu token vào localStorage
        navigate("/index"); // Chuyển hướng đến trang index
      } else {
        setError(response.data.message || "Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại."); // Hiển thị thông báo lỗi
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-lg mb-5 bg-white rounded">
            <Card.Body>
            <img
              className="mx-auto d-block"
              src="https://img.upanh.tv/2024/11/20/Logo4.png"
              alt="logo"
              style={{ maxWidth: "100px" }}
            />
              <h3 className="text-center mb-4 ">Đăng nhập</h3>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleLogin}>
                <Form.Group id="username" data-mdb-input-init className="form-outline mb-3">     
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    id="inputUsername"
                    className="form-control form-control-lg"
                  />
                  <Form.Label className="form-label" htmlFor="inputUsername">Tên đăng nhập</Form.Label>
                </Form.Group>
    
                <Form.Group id="password" data-mdb-input-init className="form-outline mb-4">
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    id="inputPassword"
                    className="form-control form-control-lg"
                  />
                  <Form.Label className="form-label" htmlFor="inputPassword">Mật khẩu</Form.Label>
                </Form.Group>
          
                <Button className="w-100 rounded-pill mb-5" type="submit" variant="primary">
                  Đăng Nhập
                </Button>

                <div className="d-flex justify-content-between mb-4 mx-2">
                  {/* Forgot Password Link */}
                  <a
                    href="/forgot-password"
                    className="text-secondary-emphasis px-0 text-decoration-none hover-link"
                  >
                    Quên mật khẩu?
                  </a> 
                  {/* Sign Up Link */}
                  <a
                    href="/register"
                    className="text-secondary-emphasis px-0 text-decoration-none hover-link"
                  >
                    Đăng ký
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