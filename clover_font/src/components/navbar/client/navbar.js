import React from 'react';
import { Navbar, Nav, Form, FormControl, Container, Row, Col } from 'react-bootstrap';
import { FaRegBell } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoMdMenu } from "react-icons/io";
import Logo from '../../images/Logo5.ico';
import { FaCartShopping } from "react-icons/fa6";
const FacebookNavbar = () => {
  return (
    <Navbar bg="light" expand="lg" className="mr-2 border border-gary rounded shadow-sm">
      <Container fluid>
        <Row className="w-100">
          <Col xs="auto" className="d-flex align-items-center">
            <Navbar.Brand href="/index">
              <img
                src={Logo}
                width="60"
                height="50"
                className="d-inline-block align-top"
              />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />


          </Col>

          <Col className="p-3 d-flex justify-content-start align-items-center me-3">
            <Form inline className="w-60">
              <FormControl
                type="text"
                placeholder="Search"
                className="w-750"
                style={{ borderRadius: '20px' }}
              />
            </Form>
          </Col>

          <Col xs="auto" className="d-flex align-items-center justify-content-end ">
            <Nav>
              <Nav.Link href="/Cart" className="fs-4">
                <FaCartShopping style={{ fontSize: '1.75rem' }} />
              </Nav.Link>

              <Nav.Link href="#menu" className="fs-4">
                <IoMdMenu style={{ fontSize: '1.75rem' }} />
              </Nav.Link>

              <Nav.Link href="#messages" className="fs-4">
                <FaRegCommentDots style={{ fontSize: '1.75rem' }} />
              </Nav.Link>

              <Nav.Link href="#notifications" className="fs-4">
                <FaRegBell style={{ fontSize: '1.75rem' }} />
              </Nav.Link>

              <Nav.Link href="/profile" className="fs-4">
                <CgProfile style={{ fontSize: '1.75rem' }} />
              </Nav.Link>
            </Nav>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
};

export default FacebookNavbar;
