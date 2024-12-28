import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ErrorPage = ({ errorCode, errorMessage }) => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    // Lấy token từ localStorage và kiểm tra vai trò người dùng
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            checkRole(token); // Gọi API kiểm tra vai trò người dùng nếu có token
        } else {
            // Nếu không có token, điều hướng đến trang login
            navigate("/login");
        }
    }, [navigate]);

    // Hàm điều hướng quay về trang chính
    const handleGoHome = () => {
        if (userRole === 1) {
            navigate("/admin"); // Điều hướng về trang quản trị
        } else {
            navigate("/index"); // Điều hướng về trang chủ
        }
    };

    const checkRole = async (token) => {
        try {
            const responseRole = await axios.get("http://localhost:8080/api/login/checkRoleSell", {
                headers: {
                    Authorization: 'Bearer ' + token,
                },
            });

            setUserRole(responseRole.data.data);
        } catch (error) {
            console.error("Error checking role:", error);
            setUserRole(null); // Đặt null nếu API lỗi
        }

    };

    return (
        <Container className="text-center mt-5">
            <Row>
                <Col>
                    <img
                        src={'https://media.istockphoto.com/id/1847449922/vi/vec-to/th%C3%B4ng-b%C3%A1o-l%E1%BB%97i-m%C3%A1y-t%C3%ADnh-3d-kh%C3%B4ng-t%C3%ACm-th%E1%BA%A5y-trang-404-d%E1%BA%A5u-ch%E1%BA%A5m-than-v%C4%83n-b%E1%BA%A3n-kh%C3%B4ng-t%C3%ACm-th%E1%BA%A5y-trang.jpg?s=612x612&w=0&k=20&c=QJyTSX3iCm2bJv3aVrlA51Qg1sjOIGacH1z0cO4hOIU='}
                        alt="Error Illustration"
                        style={{ maxWidth: "400px", marginBottom: "20px" }}
                    />
                    <h1 style={{ fontSize: "3rem", fontWeight: "bold", color: "#dc3545" }}>
                        {errorCode || "Lỗi!"}
                    </h1>
                    <p style={{ fontSize: "1.5rem", color: "#6c757d" }}>
                        {errorMessage || "Hiện tại không thể thực hiện yêu cầu. Xin vui lòng thử lại."}
                    </p>
                    <Button variant="primary" onClick={handleGoHome}>
                        Quay lại trang chủ
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default ErrorPage;

