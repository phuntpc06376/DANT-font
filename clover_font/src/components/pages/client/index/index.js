import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Nav, Form, FormControl, Button, Card, ListGroup, Image, Dropdown, Modal } from 'react-bootstrap';
import { FaUserFriends, FaSave, FaStore, FaThumbsUp, FaComment, FaShare, FaTrash, FaEdit, FaReply } from 'react-icons/fa';
import { FaCartShopping } from "react-icons/fa6";
import { RiBillLine } from "react-icons/ri";
import { Link, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import Swal from "sweetalert2";
import './index.css';
import axios from 'axios';

const Sidebar = () => (
  <Nav
    defaultActiveKey="home"
    className="flex-column mt-3 p-3shadow-sm sidebar bg-white border-5"
    style={{ width: "250px" }}
  >
    {/* <Nav.Link href="profile" className="text-dark mb-2 p-2">
      <FaUserFriends className="me-2" /> Bạn bè
    </Nav.Link> */}
    <div className="btn-wrapper ">
      <button
        className="btn-custom"
        onClick={() => (window.location.href = "ProductGallery")}
      >
        <FaStore className="me-2" />Marketplace
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
  const [responses, setResponses] = useState({}); // Lưu trữ các phản hồi của mỗi comment
  const [showReplies, setShowReplies] = useState({});
  const [showReplyForm, setShowReplyForm] = useState(null); // Hiển thị form trả lời cho bình luận
  const [replyContent, setReplyContent] = useState(''); // Nội dung phản hồi



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
  const [showReportModal, setShowReportModal] = useState(false);
  const [denunciationId, setdenunciationId] = useState("");
  const [denounceContent, setDenounceContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Kiểm tra xem việc tố cáo có đang được gửi hay không

  const fetchDenounceContent = async () => {
    const token = localStorage.getItem("token");
    if (!token) return console.error("No token found. Redirecting to login...");
    try {
      const response = await fetch("http://localhost:8080/api/denounceContents", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setDenounceContent(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching denounce content:", error);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchDenounceContent();  // Fetch data when the component mounts
  }, []);

  // Hàm mở modal khi nhấn vào nút "Tố cáo"
  const handleReportClick = () => {
    setShowReportModal(true);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setShowReportModal(false);
  };

  // Hàm khi chọn lý do tố cáo
  const handleReportSubmit = async () => {
    if (!denunciationId) {
      alert("Vui lòng chọn lý do tố cáo");
      return;
    }

    if (!postId) {
      alert("Không có ID bài viết");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch("http://localhost:8080/api/reportPost", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: postId,
          denunciationId: denunciationId,
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      alert("Tố cáo thành công!");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
      handleCloseModal();
    }
  };



  const handleReplyComment = (commentId) => {
    if (!responses[commentId]) {
      fetchResponses(commentId); // Lấy phản hồi nếu chưa có
    }
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId], // Đổi trạng thái hiển thị phản hồi
    }));
  };
  const fetchResponses = async (commentId) => {
    try {
      setLoading(true); // Bắt đầu loading

      // Lấy token từ localStorage hoặc từ một biến nào đó
      const token = localStorage.getItem('token'); // Hoặc cách bạn lưu token

      // Thêm header Authorization vào yêu cầu
      const response = await axios.get(`http://localhost:8080/api/social/responseComment/getAllByComment?commentId=${commentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm token vào header
        },
      });

      console.log(response.data); // In ra dữ liệu trả về từ API

      // Xử lý dữ liệu ở đây (lưu vào state chẳng hạn)
      setResponses((prev) => ({
        ...prev,
        [commentId]: response.data, // Lưu phản hồi của mỗi bình luận vào state
      }));
      fetchPosts();
    } catch (error) {
      console.error("Có lỗi xảy ra khi tải phản hồi:", error);
      // Xử lý lỗi nếu có
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  const handleReplyClick = (commentId) => {
    setShowReplyForm(commentId); // Hiển thị form trả lời cho bình luận cụ thể
  };

  const handleReplyChange = (e) => {
    setReplyContent(e.target.value); // Cập nhật nội dung phản hồi
  };


  const handleSubmitReply = async (commentId) => {
    if (isSubmitting) return; // Nếu đang gửi, không gửi lại
    setIsSubmitting(true);

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('token'); // Thay thế 'token' bằng tên key mà bạn lưu trữ token

      // Tạo một đối tượng FormData
      const formData = new FormData();

      // Thêm dữ liệu vào FormData
      formData.append('content', replyContent); // Nội dung phản hồi
      formData.append('comment', commentId); // ID của bình luận

      // Log the data before sending it
      console.log('Sending data:', {
        content: replyContent,
        comment: {
          id: commentId,
        },
      });

      // Gửi dữ liệu vào API với header Authorization
      const response = await axios.post(
        'http://localhost:8080/api/social/responseComment/create',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Thêm header Authorization với token
            'Content-Type': 'multipart/form-data', // Xác định Content-Type là multipart/form-data
          },
        }
      );
      console.log(response)
      // Nếu gửi thành công, cập nhật phản hồi
      setReplyContent(''); // Làm trống ô nhập liệu
      setShowReplyForm(null); // Ẩn form trả lời
      fetchPosts();
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi', error);
      alert('Có lỗi xảy ra khi gửi phản hồi!');
    } finally {
      setIsSubmitting(false);
     
    }
  };

  const handleDeleteReply = async (replyId, e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);
  
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token'); // Ensure the correct token is stored
      // Send DELETE request to the backend API
      const response = await axios.delete(
        `http://localhost:8080/api/social/responseComment/delete?id=${replyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add Authorization header with token
          },
        }
      );
  
      console.log(response);
      alert('Phản hồi đã được xóa!');
  
      // Optimistically update the state by filtering out the deleted reply
    } catch (error) {
      console.error('Lỗi khi xóa phản hồi', error);
      alert('Có lỗi xảy ra khi xóa phản hồi!');
    } finally {
      setIsSubmitting(false);
    }
  };
  




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
                className="rounded-circle me-3 border-3 " style={{ width: "60px", height: "45px" }}
              />
            </div>
          </Col>
          <Col xs={10}>
            <div>
              <Link
                key={userName}
                to={`/profiles/${encodedUserName}`}
                className="text-decoration-none text-dark"
                onClick={handleClick}
              >
                <h5>{userFullname}</h5>
              </Link>
              <p>{timeStamp}</p>
            </div>

            {/* Dropdown menu "⋮" */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: "10px",
              }}
            >
              <Dropdown>
                <Dropdown.Toggle
                  variant="light"
                  className="custom-dropdown-toggle border-0 p-0"
                  style={{
                    backgroundColor: "white", // Màu nền trắng
                    color: "black", // Màu của dấu "..."
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  ⋮
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleReportClick}>
                    Tố cáo
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>


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
                initialComments.map((commentItem, index) => (
                  <div key={index}>
                    <ListGroup.Item
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
                            style={{ cursor: 'pointer', marginLeft: '10px' }}
                          >
                            <FaSave />
                          </div>
                        ) : (
                          <div
                            className="text-warning"
                            onClick={() => handleEditComment(commentItem.id, commentItem.content)}
                            style={{ cursor: 'pointer', marginRight: '10px' }}
                          >
                            <FaEdit />
                          </div>
                        )}
                        <div
                          className="text-danger"
                          onClick={() => handleDeleteComment(commentItem.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <FaTrash />
                        </div>
                      </div>
                      {(
                        <ListGroup.Item
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            padding: '10px',
                            backgroundColor: '#f8f9fa', // optional for a different background
                          }}
                        >
                          <div
                            className="text-info"
                            onClick={() => handleReplyComment(commentItem.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            Xem phản hồi
                          </div>
                        </ListGroup.Item>
                      )}


                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Nút Trả lời */}
                        <div
                          variant="info"
                          onClick={() => handleReplyClick(commentItem.id)}
                          style={{ marginLeft: '10px' }}
                        >
                          Trả lời
                        </div>

                        {/* Nút Xóa */}
                      </div>

                      {/* Hiển thị form trả lời */}
                      {showReplyForm === commentItem.id && (
                        <div style={{ marginTop: '10px', paddingLeft: '20px' }}>
                          <Form>
                            <Form.Group controlId="replyContent">
                              <Form.Control
                                as="textarea"
                                rows={3}
                                value={replyContent}
                                onChange={handleReplyChange}
                                placeholder="Nhập phản hồi của bạn..."
                              />
                            </Form.Group>
                            <Button
                              variant="primary"
                              onClick={() => handleSubmitReply(commentItem.id)}
                              disabled={isSubmitting || !replyContent}
                            >
                              {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                            </Button>
                          </Form>
                        </div>
                      )}



                    </ListGroup.Item>



                    {/* Tách nút "Xem phản hồi" ra ngoài */}


                    {/* Hiển thị các phản hồi nếu có và nếu "Xem phản hồi" được nhấn */}
                    {showReplies[commentItem.id] && responses[commentItem.id] && responses[commentItem.id].length > 0 && (
                      <div className="mt-2" style={{ paddingLeft: '20px' }}>
                        {responses[commentItem.id].map((response, idx) => (
                          <div key={idx} style={{ textAlign: 'left' }}>
                            <strong>{response?.account?.fullname || 'Người dùng ẩn'}:</strong> {response.content}



                            <div
                              variant="danger"
                              onClick={(e) => handleDeleteReply(response.id,e)}
                              style={{ marginLeft: '10px', cursor: 'pointer', color: 'red' }}
                            >
                              Xóa
                            </div>


                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>Chưa có bình luận nào.</p>
              )}
            </ListGroup>


          </div>
        )}

        {/* Modal hiển thị lý do tố cáo */}
        <Modal show={showReportModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Chọn lý do tố cáo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="reportReason">
                <Form.Label>Lý do tố cáo</Form.Label>
                <Form.Control
                  as="select"
                  value={denunciationId}
                  onChange={(e) => setdenunciationId(e.target.value)}
                >
                  <option value="">Chọn lý do</option>
                  {denounceContent.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.content}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={() => handleReportSubmit()}
              disabled={isSubmitting || !denunciationId}
            >
              {isSubmitting ? "Đang gửi..." : "Tố cáo"}
            </Button>
          </Modal.Footer>
        </Modal>


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
