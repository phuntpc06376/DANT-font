import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Nav, Form, FormControl, Button, Card, ListGroup, Image } from 'react-bootstrap';
import { FaUserFriends, FaSave, FaStore, FaThumbsUp, FaComment, FaShare, FaTrash, FaEdit } from 'react-icons/fa';
import { FaCartShopping } from "react-icons/fa6";
import { RiBillLine } from "react-icons/ri";
import { Link, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import Swal from "sweetalert2";
import './index.css';

const Sidebar = () => (
  <Nav
    defaultActiveKey="home"
    className="flex-column mt-3 p-3shadow-sm sidebar bg-white border-5"
    style={{ width: "250px" }}
  >
    {/* <Nav.Link href="profile" className="text-dark mb-2 p-2">
      <FaUserFriends className="me-2" /> Bạn bè
    </Nav.Link> */}
    <h2 className="text-dark mb-4 p-2 text-center text-success">Colver</h2>

    <div className="btn-wrapper ">
      <button
        className="btn-custom"
        onClick={() => (window.location.href = "ProductGallery")}
      >
        <FaStore className="me-2" /> Mua hàng
      </button>
    </div>
    <div className="btn-wrapper  mt-3">
      <button
        className="btn-custom"
        onClick={() => (window.location.href = "orderSummary")}
      >
        <RiBillLine className="me-2" /> Hóa đơn
      </button>
    </div>
    <div className="btn-wrapper mt-3">
      <button
        className="btn-custom"
        onClick={() => (window.location.href = "cart")}
      >
        <FaCartShopping className="me-2" /> Giỏ hàng
      </button>
    </div>
  </Nav>
);



const MainContent = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);


  useEffect(() => {
    fetchPosts();
  }, []);


  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    // if (!token) return console.error("No token found. Redirecting to login...");
    try {
      const response = await fetch("http://localhost:8080/api/post", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
      // console.log(data)
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }

  };



  const handleFileSelect = (e) => {
    setSelectedFiles(e.target.files);
  };



  const handlePostSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const user = localStorage.getItem('user');
    const currentUserAccountId = user ? JSON.parse(user).accountId : null; // Lấy accountId từ localStorage
    if (!token) {
      console.error("No token found. Cannot create post.");
      return;
    }

    const formData = new FormData();
    formData.append('content', newPostContent);
    formData.append('postDay', new Date().toISOString());
    formData.append('accountId', currentUserAccountId); // Sử dụng ID người dùng thực tế
    
    for (let file of selectedFiles) {
      formData.append('files', file);
    }

    try {
      const response = await fetch("http://localhost:8080/api/post/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setNewPostContent("");
        setSelectedFiles([]);
        fetchPosts();

        // Thông báo thành công
        Swal.fire({
          icon: 'success',
          title: 'Bài đăng thành công!',
          text: 'Bài viết của bạn đã được đăng.',
        });
      } else {
        const errorData = await response.json();
        console.error("Error creating post:", errorData);

        // Thông báo lỗi
        Swal.fire({
          icon: 'error',
          title: 'Đăng bài thất bại!',
          text: errorData.message || 'Đã có lỗi xảy ra, vui lòng thử lại.',
        });
      }
    } catch (error) {
      console.error("Error creating post:", error);

      // Thông báo lỗi khi không kết nối được server
      Swal.fire({
        icon: 'error',
        title: 'Đăng bài thất bại!',
        text: 'Không thể kết nối đến máy chủ, vui lòng thử lại.',
      });
    }
  };


  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId)); // Remove the deleted post from the list
  };

  return (
    <div>
      <Card className="mb-3 mt-3 p-3 shadow-sm">
        <Form onSubmit={handlePostSubmit} encType="multipart/form-data">
          <Form.Group controlId="newPostContent">
            <FormControl
              type="text"
              placeholder="Bạn muốn đăng gì?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="border-0"
              required
            />
          </Form.Group>
          <Form.Group controlId="fileInput" className="mt-2">
            <FormControl type="file" multiple onChange={handleFileSelect} />
          </Form.Group>
          <Button type="submit" className="mt-2 text-dark bg-white hover-shadow border-0">
            Đăng bài
          </Button>
        </Form>
      </Card>
      {loading ? (
        <p>Loading...</p>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <Post
            key={post.id}
            postId={post.id}
            userImage={post?.account?.avatar ? `http://localhost:8080/image/${post.account.avatar}` : "default-avatar.png"}
            userName={post?.account?.username || "Unknown User"}
            userFullname={post?.account?.fullname}
            timeStamp={new Date(post.postDay).toLocaleString()}
            Img={post?.postImages}
            content={post.content}
            likes={post.likes || []}
            initialComments={post.comments || []}
            accountId={post.account.id} // Make sure this is correct
            onPostDeleted={handlePostDeleted} // Truyền hàm xóa bài đăng
            fetchPosts={fetchPosts}
          />
        ))
      ) : (
        <p>Không có bài viết nào.</p>
      )}

    </div>
  );

};

// Post Component
const Post = ({ currentUserName, postId, userImage, userName, timeStamp, content, likes,
  initialComments, accountId, onPostDeleted, fetchPosts, userFullname, Img }) => {
  // const [likesCount, setLikesCount] = useState(likes.length);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes.length);
  // const [comments, setComments] = useState(initialComments || []);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  // Lấy accountId của người dùng từ localStorage
  const user = localStorage.getItem('user');
  const currentUserAccountId = user ? JSON.parse(user).accountId : null; // Kiểm tra và parse thông tin người dùng


  const handleLikePost = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`http://localhost:8080/api/post/likePost?id=${postId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setLikesCount(data.likes.length);
          setLiked(!liked);
          fetchPosts();
        })
        .catch((error) => console.error('Error liking post:', error));
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (token && comment.trim()) {
      const url = 'http://localhost:8080/api/social/comment/create';

      // Create a FormData object to handle form data submission
      const formData = new FormData();
      formData.append('content', comment);
      formData.append('commentDay', new Date().toISOString());
      formData.append('post', postId);  // Append the post ID

      fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // No need for 'Content-Type': 'application/json' because we are sending FormData
        },
        body: formData,  // Use formData instead of JSON
      })
        .then((response) => {
          // Log the full response for debugging
          console.log(response);

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          // Attempt to parse the response as JSON, if possible
          return response.text().then(text => text ? JSON.parse(text) : {});
        })
        .then((data) => {
          fetchPosts();
          setComment('');
        })
        .catch((error) => console.error('Error submitting comment:', error));
    }
  };

  const handleDeleteComment = async (commentID) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Redirecting to login...");
      Swal.fire({
        icon: 'error',
        title: 'Xóa bình luận thất bại!',
        text: 'Không tìm thấy token xác thực.',
      });
      return;
    }

    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa bình luận này?',
      text: 'Hành động này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const url = `http://localhost:8080/api/social/comment/delete?id=${commentID}`;

        try {
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error deleting comment:", errorData);

            Swal.fire({
              icon: 'error',
              title: 'Xóa bình luận thất bại!',
              text: errorData.message || 'Đã có lỗi xảy ra, vui lòng thử lại.',
            });
            return;
          }

          // Thông báo xóa thành công
          Swal.fire({
            icon: 'success',
            title: 'Xóa bình luận thành công!',
            text: 'Bình luận của bạn đã được xóa.',
          });

          // Cập nhật danh sách bình luận hoặc trạng thái
          fetchPosts(); // Nếu cần cập nhật lại danh sách bài đăng và bình luận
        } catch (error) {
          console.error("Error deleting comment:", error);

          Swal.fire({
            icon: 'error',
            title: 'Xóa bình luận thất bại!',
            text: 'Bình luận này không thuộc của tài khoản này !',
          });
        }
      }
    });
  };

  // console.log(Img);


  const [isEditing, setIsEditing] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [comments, setComments] = useState([]);

  const handleEditComment = (commentId, content) => {
    setIsEditing(commentId);
    setEditedComment(content);
  };

  const handleUpdateComment = (commentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.',
      });
      return;
    }

    // Lấy bình luận gốc để reset nếu cần
    const originalComment = comments.find((comment) => comment.id === commentId)?.content;

    // Tạo đối tượng FormData
    const formData = new FormData();
    formData.append('id', commentId);
    formData.append('content', editedComment); // Dữ liệu chỉnh sửa bình luận

    fetch(`http://localhost:8080/api/social/comment/update`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        // Không cần thiết lập 'Content-Type' khi gửi FormData
      },
      body: formData, // Sử dụng formData thay vì JSON
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || 'Cập nhật bình luận thất bại.');
          });
        }
        return response.json();
      })
      .then((data) => {
        // Xử lý khi cập nhật thành công
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId ? data : comment
          )
        );
        setIsEditing(null);
        setEditedComment('');
        fetchPosts();

        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Bình luận đã được cập nhật thành công.',
        });
      })
      .catch((error) => {
        console.error('Error updating comment:', error);

        // Reset lại nội dung bình luận về trạng thái ban đầu
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, content: originalComment } // Khôi phục nội dung gốc
              : comment
          )
        );

        Swal.fire({
          icon: 'error',
          title: 'Cập nhật thất bại!',
          text: 'Bình luận này không thuộc tài khoản này. Nội dung đã được reset.',
        });
      });
  };



  const navigate = useNavigate();
  const handleClick = (e) => {
    if (userName === currentUserName) {
      e.preventDefault(); // Ngăn không cho chuyển hướng mặc định
      navigate('/user/profile'); // Điều hướng đến trang cá nhân
    }
  };


  //mã hóa userName
  const encodedUserName = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userName));
  return (
    <Card className="mb-3 mt-3 p-3 border shadow-sm card-post">
      <Card.Body>
        <Row>
          <Col xs={2}>
          <div className="imgAt">
          <img 
              src={userImage || 'default-avatar.png'}
              alt="user-avatar"
              className="rounded-circle me-3 border-3 " style={{ width: "60px", height: "45px"}}
            />
          </div>
          </Col>
          <Col xs={10}>
            <Link
              key={userName}
              to={`/profiles/${encodedUserName}`}
              className="text-decoration-none text-dark"
              onClick={handleClick}
            >
              <h5>{userFullname}</h5>
            </Link>
            <p>{timeStamp}</p>
            {/* <div variant="link" className="text-danger float-end" onClick={handleDeletePost}>
          <FaTrash />
        </div> */}
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>
            <p>{content}</p>

          </Col>
          <div className={`fb-post-images fb-images-${Img.length}`}>
            {Img.map((image, index) => (
              <div key={index} className="fb-post-image-wrapper">
                <img
                  src={`http://localhost:8080/image/${image?.nameImage}`}
                  alt={`Image ${index + 1}`}
                  className="fb-post-image" 
                />
              </div>
            ))}
          </div>

        </Row>
        <hr />
        <Row className="text-center mt-3">
          <Col>
            <div
              variant="link"
              className="text-dark"
              onClick={handleLikePost}
              style={{ color: liked ? 'hotpink' : 'inherit' }} // Thêm style để thay đổi màu khi liked
            >
              <FaThumbsUp /> {liked ? 'Thích' : 'Thích'} ({likes.length})
            </div>
          </Col>
          <Col>
            <div variant="link" className="text-dark" onClick={() => setShowCommentBox(!showCommentBox)}>
              <FaComment /> Bình luận
            </div>
          </Col>
          <Col>
            {/* <div variant="link" className="text-dark">
          <FaShare /> Chia sẻ
        </div> */}
          </Col>
        </Row>
        {showCommentBox && (
          <div className="mt-3">
            <Form onSubmit={handleCommentSubmit}>
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Viết bình luận..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="mt-2">
                Đăng
              </Button>
            </Form>
            <ListGroup className="mt-3">
              {initialComments.length > 0 ? (
                initialComments.map((commentItem, index) => {
                  return (
                    <ListGroup.Item
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        padding: '10px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <strong>{commentItem?.account?.fullname || 'Người dùng ẩn'}:</strong>
                        {isEditing === commentItem.id ? (
                          <textarea
                            value={editedComment}
                            onChange={(e) => setEditedComment(e.target.value)}
                            rows={3}
                            style={{
                              width: '100%',
                              marginLeft: '10px',
                              resize: 'none',
                              padding: '5px',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              marginBottom: '5px',
                            }}
                          />
                        ) : (
                          <span style={{ marginLeft: '10px' }}>{commentItem.content}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isEditing === commentItem.id ? (
                          <div
                            className="text-success"
                            onClick={() => handleUpdateComment(commentItem.id)}
                            style={{
                              cursor: 'pointer',
                              marginLeft: '10px',
                            }}
                          >
                            <FaSave />
                          </div>
                        ) : (
                          <div
                            className="text-warning"
                            onClick={() => handleEditComment(commentItem.id, commentItem.content)}
                            style={{
                              cursor: 'pointer',
                              marginRight: '10px',
                            }}
                          >
                            <FaEdit />
                          </div>
                        )}
                        <div
                          className="text-danger"
                          onClick={() => handleDeleteComment(commentItem.id)}
                          style={{
                            cursor: 'pointer',
                          }}
                        >
                          <FaTrash />
                        </div>
                      </div>
                    </ListGroup.Item>
                  );
                })
              ) : (
                <p>Chưa có bình luận nào.</p>
              )}
            </ListGroup>
          </div>
        )}
      </Card.Body>
    </Card>

  );
};

// Contacts Component
const Contacts = () => (
  <Card className="mt-3 p-3 bg-white shadow-sm contacts">
    <Card.Title>Danh sách bạn bè</Card.Title>
    <ListGroup variant="flush">
      <ListGroup.Item className="d-flex align-items-center">
        <Image src="https://via.placeholder.com/30" roundedCircle className="me-3" />
        Danh Piy Truong
      </ListGroup.Item>
      <ListGroup.Item className="d-flex align-items-center">
        <Image src="https://via.placeholder.com/30" roundedCircle className="me-3" />
        Trí Tài
      </ListGroup.Item>
    </ListGroup>
  </Card>
);

// HomePage Component
const HomePage = () => (
  <Container fluid style={{ backgroundColor: "#eee" }}>
    <Row>
      <Col md={2}>
        <Sidebar />
      </Col>
      <Col md={1}>

      </Col>
      <Col md={6} className="main-content">
        <MainContent />
      </Col>
      <Col md={3}>
        <Contacts />
      </Col>
    </Row>
  </Container>

);

export default HomePage;
