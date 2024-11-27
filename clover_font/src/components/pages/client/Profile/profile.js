import React from 'react';
import { Container, Row, Col, Button, Nav } from 'react-bootstrap';

const ProfilePage = () => {
  return (
    <Container className="p-0">
      {/* Cover Photo Placeholder */}
      <div className="bg-secondary" style={{ height: '270px', position: 'relative' }}>
        <Button 
          variant="light" 
          className="position-absolute bottom-0 end-0 m-3"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        >
          Chỉnh sửa ảnh bìa
        </Button>
      </div>

      {/* Profile Info */}
      <Row className="align-items-center mt-3 px-3 justify-content-center">
        <Col xs={12} md={8} lg={6} className="text-center">
          <div className="bg-dark rounded-circle mx-auto" style={{ width: '150px', height: '150px' }}></div>
          <h2 className="mt-3">Nguyễn Phú</h2>
          <p>68 người bạn</p>
          {/* Friends Avatars Placeholder */}
        </Col>
      </Row>

      {/* Profile Actions */}
      <Row className="mt-3 px-3 justify-content-center">
        <Col xs={12} md={8} lg={6} className="text-center">
          <Button variant="primary" className="mr-2">+ Thêm vào tin</Button>
          <Button variant="light" className="border">Chỉnh sửa trang cá nhân</Button>
        </Col>
      </Row>

      {/* Navigation Links */}
      <Row className="mt-3 px-3 justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Nav className="justify-content-center">
            <Nav.Link className="nav-link text-primary">Bài viết</Nav.Link>
            <Nav.Link className="nav-link text-primary">Giới thiệu</Nav.Link>
            <Nav.Link className="nav-link text-primary">Bạn bè</Nav.Link>
            <Nav.Link className="nav-link text-primary">Ảnh</Nav.Link>
            <Nav.Link className="nav-link text-primary">Video</Nav.Link>
            <Nav.Link className="nav-link text-primary">Reels</Nav.Link>
            <Nav.Link className="nav-link text-primary">Xem thêm</Nav.Link>
          </Nav>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
