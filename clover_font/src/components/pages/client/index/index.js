import React, { useState } from 'react';
import { Container, Row, Col, Nav, Form, FormControl, Button, Card, ListGroup, Image } from 'react-bootstrap';
import { FaUserFriends, FaClock, FaSave, FaUsers, FaVideo, FaStore, FaThumbsUp, FaComment, FaShare, FaEdit, FaTrashAlt } from 'react-icons/fa';

const Sidebar = () => (
  <Nav defaultActiveKey="/home" className="flex-column mt-3 border border-gary rounded shadow-lg p-3" 
  style={{ fontSize: '1.25rem', width: '350px' }}>
    <Nav.Link href="#profile" className='text-dark mb-2 p-2 text-decoration-none hover:bg-primary hover:text-white'>
      <FaUserFriends /> Bạn bè
    </Nav.Link>
    <Nav.Link href="#memories" className='text-dark mb-2 p-2 text-decoration-none hover:bg-primary hover:text-white'>
      <FaClock /> Kỷ niệm
    </Nav.Link>
    <Nav.Link href="#saved" className='text-dark mb-2 p-2 text-decoration-none hover:bg-primary hover:text-white'>
      <FaSave /> Đã lưu
    </Nav.Link>
    <Nav.Link href="#groups" className='text-dark mb-2 p-2 text-decoration-none hover:bg-primary hover:text-white'>
      <FaUsers /> Nhóm
    </Nav.Link>
    <Nav.Link href="#videos" className='text-dark mb-2 p-2 text-decoration-none hover:bg-primary hover:text-white'>
      <FaVideo /> Video
    </Nav.Link>
    <Nav.Link href="/ProductGallery" className=' text-dark mb-2 p-2 text-decoration-none hover:bg-primary hover:text-white'>
      <FaStore /> Marketplace
    </Nav.Link>
  </Nav>
);

const Post = ({ userImage, userName, timeStamp, content }) => {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editComment, setEditComment] = useState('');

  const handleCommentClick = () => {
    setShowCommentBox(!showCommentBox);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim() !== '') {
      setComments([...comments, comment]);
      setComment(''); // Clear the input field after submitting
    }
  };

  const handleEditCommentChange = (e) => {
    setEditComment(e.target.value);
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditComment(comments[index]);
  };

  const handleEditSubmit = (e, index) => {
    e.preventDefault();
    const updatedComments = [...comments];
    updatedComments[index] = editComment;
    setComments(updatedComments);
    setEditingIndex(null); // Exit edit mode
  };

  const handleDeleteClick = (index) => {
    const updatedComments = comments.filter((_, i) => i !== index);
    setComments(updatedComments);
  };

  return (
    <Card className="mb-3 mt-3 border border-gary rounded shadow-sm">
      <Card.Body>
        <Row>
          <Col xs={2}>
            <Image src={userImage} roundedCircle width="50" height="50" />
          </Col>
          <Col>
            <Card.Title>{userName}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{timeStamp}</Card.Subtitle>
          </Col>
        </Row>
        <Card.Text>{content}</Card.Text>
        <Row>
          <Col>
            <Button variant="link" className="text-decoration-none m-1 bg-light text-dark"><FaThumbsUp /> Like</Button>
          </Col>
          <Col>
            <Button variant="link" className="text-decoration-none m-1 bg-light text-dark" onClick={handleCommentClick}><FaComment /> Comment</Button>
          </Col>
          <Col>
            <Button variant="link" className="text-decoration-none m-1 bg-light text-dark"><FaShare /> Share</Button>
          </Col>
        </Row>

        {showCommentBox && (
          <>
            <Form onSubmit={handleCommentSubmit} className="mt-3">
              <Form.Group controlId="comment">
                <Form.Control
                  type="text"
                  placeholder="Viết bình luận..."
                  value={comment}
                  onChange={handleCommentChange}
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-2">
                Đăng
              </Button>
            </Form>

            {/* Display the list of comments */}
            <ListGroup className="mt-3">
              {comments.map((comment, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-start">
                  {editingIndex === index ? (
                    <Form onSubmit={(e) => handleEditSubmit(e, index)} className="flex-grow-1">
                      <Form.Control
                        type="text"
                        value={editComment}
                        onChange={handleEditCommentChange}
                        className="me-2"
                      />
                      <Button variant="success" type="submit" className="me-2">Lưu</Button>
                      <Button variant="secondary" onClick={() => setEditingIndex(null)}>Hủy</Button>
                    </Form>
                  ) : (
                    <>
                      <div className="flex-grow-1">
                        <strong>{userName}:</strong> {comment}
                      </div>
                      <div>
                        <Button variant="link" className="p-0 me-2" onClick={() => handleEditClick(index)}><FaEdit /></Button>
                        <Button variant="link" className="p-0 text-danger" onClick={() => handleDeleteClick(index)}><FaTrashAlt /></Button>
                      </div>
                    </>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

const MainContent = () => (
  <div>
    <Card className="mb-3 mt-3">
      <Card.Body>
        <Form>
          <FormControl type="text" placeholder="Phú ơi, bạn đang nghĩ gì thế?" />
        </Form>
      </Card.Body>
    </Card>
    <Post
      userImage="https://via.placeholder.com/50"
      userName="Nguyễn Phú"
      timeStamp="1 giờ trước"
      content="Đây là bài đăng của tôi trên clover giả lập."
    />
    <Post
      userImage="https://via.placeholder.com/50"
      userName="Phan Sang"
      timeStamp="1 giờ trước"
      content="Đây là bài đăng của tôi trên clover giả lập."
    />
    <Post
      userImage="https://via.placeholder.com/50"
      userName="Phú đẹp trai vcl"
      timeStamp="1 giờ trước"
      content="Đây là bài đăng của tôi trên clover giả lập."
    />
  </div>
);

const Contacts = () => (
  <ListGroup className='mt-3 border border-gary rounded shadow-sm'>
    <ListGroup.Item className='bg-light text-dark'>Danh Piy Truong</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Trí Tài</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Văn Qui</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Thu Thuy Nguyen</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Nguyen Phuoc</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Nhật Thanh</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Thang Phan Van</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Phúc Bùi</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Đặng Khang</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Tài Nguyễn</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Phuong Tran</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Le Phuong Tien</ListGroup.Item>
    <ListGroup.Item className='bg-light text-dark'>Trường Giang</ListGroup.Item>
  </ListGroup>
);

const HomePage = () => (
  <Container fluid>
    <Row>
      <Col md={3}>
        <Sidebar />
      </Col>
      <Col md={6}>
        <MainContent />
      </Col>
      <Col md={3}>
        <Contacts />
      </Col>
    </Row>
  </Container>
);

export default HomePage;
