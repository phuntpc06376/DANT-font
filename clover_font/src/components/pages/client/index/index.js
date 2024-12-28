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
import { acceptFriend, getAllFriendsByUsernameToConfirm } from "../services/friend_service.js";
import { deleteFriend } from '../services/friend_service.js';
import { addToFriend } from '../services/friend_service.js';
import { getAllFriendsByUsername } from '../services/friend_service.js';
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const Sidebar = (userImage) => (
  <Nav
    defaultActiveKey="home"
    className="flex-column mt-3 p-3shadow-sm sidebar "
    style={{ width: "250px", backgroundColor: "#eee" }}
  >
    {/* <Nav.Link href="profile" className="text-dark mb-2 p-2">
      <FaUserFriends className="me-2" /> Bạn bè
    </Nav.Link> */}
    {/* <div className="imgAt">
              <img
                src={userImage || 'default-avatar.png'}
                alt="user-avatar"
                className="rounded-circle me-3 border-3 " style={{ width: "60px", height: "45px" }}
              />
      </div> */}
    <div className="btn-wrapper ">
      <div
        className="btn-custom"
        style={{ backgroundColor: "#eee" }}

        onClick={() => (window.location.href = "ProductGallery")}

      >
        <FaStore className="me-2" />Marketplace
      </div>
    </div>
    <div className="btn-wrapper  mt-3">
      <div
        className="btn-custom"
        style={{ backgroundColor: "#eee" }}
        onClick={() => (window.location.href = "orderSummary")}
      >
        <RiBillLine className="me-2" /> Hóa đơn
      </div>
    </div>
    <div className="btn-wrapper mt-3">
      <div
        className="btn-custom"
        style={{ backgroundColor: "#eee" }}
        onClick={() => (window.location.href = "cart")}
      >
        <FaCartShopping className="me-2" /> Giỏ hàng
      </div>
    </div>
    <div className="btn-wrapper mt-3">
      <div
        className="btn-custom"
        style={{ backgroundColor: "#eee" }}
        onClick={() => (window.location.href = "friend")}
      >
        <FaUserFriends className="me-2" /> Bạn bè
      </div>
    </div>
  </Nav>
);



const MainContent = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentUser2, setCurrentUser2] = useState("");
  const [checklikePost, setCheckLikePost] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    // if (!token) return console.error("No token found. Redirecting to login...");
    if (token) {
      // Gọi API backend
      fetch('http://localhost:8080/api/account', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Gửi token trong header Authorization
        },
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {


              const currentUserName2 = data;
              setCurrentUser2(currentUserName2);
            })
          }
        })
    }

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
        // fetchPosts();

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
          <Button type="submit" className="mt-2 text-dark  hover-shadow border-0">
            Đăng bài
          </Button>
        </Form>
      </Card>
      {
        loading ? (
          <p>Loading...</p>
        ) : posts.length > 0 ? (
          [...posts]
            // .sort((a, b) => new Date(b.postDay) - new Date(a.postDay)) // Sắp xếp bài viết theo ngày
            .map((post) => (
              <Post
                key={post.id}
                postId={post.id}
                userImage={
                  post?.account?.avatar
                    ? `http://localhost:8080/image/${post.account.avatar}`
                    : "default-avatar.png"
                }
                currentUser2={currentUser2.username}
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
                checklikePost={
                  currentUser2.id ?
                    post.likes?.some((like) => {
                      if (isNaN(like.account.id) || isNaN(currentUser2.id)) {
                        console.log('Một trong hai id không phải là số hợp lệ');
                        return false;
                      }
                      return like.account.id === currentUser2.id;
                    }) || false
                    : false
                }
                accountLogin={currentUser2}
                postShare={post?.sharePost || []}
              />
            ))

        ) : (
          <p>Không có bài viết nào.</p>
        )
      }


    </div>
  );

};

// Post Component
const Post = ({ currentUserName, postId, userImage, userName, timeStamp, content, likes, accountLogin, postShare,
  initialComments, accountId, onPostDeleted, fetchPosts, userFullname, Img, currentUser2, checklikePost }) => {
  // const [likesCount, setLikesCount] = useState(likes.length);

  const [liked, setLiked] = useState(checklikePost);
  const [likesCount, setLikesCount] = useState(likes.length);
  // const [comments, setComments] = useState(initialComments || []);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [responses, setResponses] = useState({}); // Lưu trữ các phản hồi của mỗi comment
  const [showReplies, setShowReplies] = useState({});
  const [showReplyForm, setShowReplyForm] = useState(null); // Hiển thị form trả lời cho bình luận
  const [replyContent, setReplyContent] = useState(''); // Nội dung phản hồi
  const [editingReplyId, setEditingReplyId] = useState(null); // ID phản hồi đang chỉnh sửa
  const [editedReplyContent, setEditedReplyContent] = useState(''); // Nội dung mới
  const [showLikesAccModal, setShowLikesAccModal] = useState(false);//Hiển thị danh sách người đã like
  const [likeAccounts, setLikeAccounts] = useState([]);//Danh sách người đã like



  // Lấy accountId của người dùng từ localStorage


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

          // Cập nhật trạng thái liked theo cách bất đồng bộ
          setLiked((prevLiked) => !prevLiked);

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
    console.log(e)
    const token = localStorage.getItem("token");
    if (token) {
      // Gọi API backend
      fetch('http://localhost:8080/api/account', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Gửi token trong header Authorization
        },
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              console.log("data === ", data);

              const currentUserName1 = data.username;

              if (userName === currentUserName1) {
                // e.preventDefault();
                navigate('/user/profile');
              } else {
                navigate(`/profiles/${e}`);
              }
            }); // Chờ phản hồi JSON từ API
          } else {
            throw new Error('Lỗi khi lấy tài khoản');
          }
        })

        .catch((err) => {
          console.error(err);

        });
    } else {

    }
  };

  //mã hóa userName
  const [showReportModal, setShowReportModal] = useState(false);
  const [denunciationId, setdenunciationId] = useState("");
  const [denounceContent, setDenounceContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Kiểm tra xem việc tố cáo có đang được gửi hay không

  const [stompClient, setStompClient] = useState(null);
  const [posts, setPosts] = useState([]);

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
    setLiked(checklikePost);
  }, [checklikePost]);

  useEffect(() => {
    // Tạo kết nối SockJS
    const socket = new SockJS("http://localhost:8080/ws"); // URL của WebSocket server

    // Tạo đối tượng StompClient để sử dụng với SockJS
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, () => {
      // Lắng nghe các sự kiện từ server qua SockJS
      setStompClient(stompClient);
      stompClient.subscribe("/topic/reportPost", handlePostUpdated);
    });

    const handlePostUpdated = (message) => {
      const updatedPostDenounce = JSON.parse(message.body);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === updatedPostDenounce.id ? updatedPostDenounce : post
        )
      );
    };

    // Cleanup WebSocket khi component unmount
    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
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
      Swal.fire("Lỗi!", "Vui lòng chọn lý do tố cáo!", "error");
      return;
    }

    if (!postId) {
      Swal.fire("Lỗi!", "Không có ID bài viết!", "error");
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

      Swal.fire("Thành công!", "Tố cáo bài viết thành công!", "success");
      stompClient.send("/app/reportPost", {}, JSON.stringify({
        postId: postId,
        denunciationId: denunciationId,
      }));
    } catch (error) {
      console.error("Error submitting report:", error);
      Swal.fire("Lỗi!", "Có lỗi xảy ra, vui lòng thử lại!", "error");
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

    fetchPosts();

  };

  const fetchResponses = async (commentId) => {
    try {
      setLoading(true); // Bắt đầu loading

      // Lấy token từ localStorage hoặc từ một biến nào đó
      const token = localStorage.getItem('token'); // Hoặc cách bạn lưu token

      // Thêm header Authorization vào yêu cầu
      const response = await axios.get(
        `http://localhost:8080/api/social/responseComment/getAllByComment?commentId=${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        }
      );

      console.log(response.data); // In ra dữ liệu trả về từ API

      // Lưu phản hồi của mỗi bình luận vào state
      setResponses((prev) => ({
        ...prev,
        [commentId]: response.data, // Lưu phản hồi của mỗi bình luận
      }));

      // Nếu cần refresh lại danh sách bình luận, hãy giữ `fetchPosts`
      fetchPosts();
    } catch (error) {
      console.error("Có lỗi xảy ra khi tải phản hồi:", error);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };


  const handleReplyClick = (commentId) => {
    setShowReplyForm((prevId) => (prevId === commentId ? null : commentId)); // Hiển thị/Ẩn form
    fetchPosts();
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
      fetchPosts();
      // Nếu gửi thành công, cập nhật phản hồi
      setReplyContent(''); // Làm trống ô nhập liệu
      setShowReplyForm(null); // Ẩn form trả lời
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi', error);
      alert('Có lỗi xảy ra khi gửi phản hồi!');
    } finally {
      setIsSubmitting(false);

    }
  };


  const handleDeleteReply = async (replyId) => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token'); // Ensure the correct token is stored
      // Send DELETE request to the backend API
      await axios.delete(
        `http://localhost:8080/api/social/responseComment/delete?id=${replyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add Authorization header with token
          },
        }
      );

      // Show success alert with SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'Phản hồi đã được xóa!',
        showConfirmButton: false,
        timer: 1500, // Close the alert after 1.5 seconds
      });

      // Optimistically update state
      setResponses((prevResponses) => {
        const updatedResponses = { ...prevResponses };
        for (const key in updatedResponses) {
          updatedResponses[key] = updatedResponses[key].filter(
            (response) => response.id !== replyId
          );
        }
        return updatedResponses;
      });
    } catch (error) {
      console.error('Lỗi khi xóa phản hồi', error);
      Swal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra khi xóa phản hồi!',
        showConfirmButton: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const startEditReply = (replyId, currentContent) => {
    setEditingReplyId(replyId);
    setEditedReplyContent(currentContent);

  };

  const cancelEditReply = () => {
    setEditingReplyId(null);
    setEditedReplyContent('');

  };


  const handleUpdateReply = async (replyId, updatedContent) => {
    if (!updatedContent.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Nội dung không được để trống!',
        showConfirmButton: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Tạo FormData
      const formData = new FormData();
      formData.append('id', replyId);
      formData.append('content', updatedContent);

      // Gửi yêu cầu cập nhật đến API
      const token = localStorage.getItem('token'); // Đảm bảo token đã được lưu trữ
      const response = await axios.put(
        `http://localhost:8080/api/social/responseComment/update`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      fetchPosts();

      // Xử lý khi cập nhật thành công
      Swal.fire({
        icon: 'success',
        title: 'Cập nhật phản hồi thành công!',
        showConfirmButton: false,
        timer: 1500, // Tự động đóng sau 1.5 giây
      });

      setResponses((prevResponses) => {
        const updatedResponses = { ...prevResponses };
        for (const commentId in updatedResponses) {
          updatedResponses[commentId] = updatedResponses[commentId].map((response) =>
            response.id === replyId ? { ...response, content: updatedContent } : response
          );
        }
        return updatedResponses;
      });

      cancelEditReply();
    } catch (error) {
      console.error('Lỗi khi cập nhật phản hồi:', error);
      Swal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra khi cập nhật phản hồi!',
        showConfirmButton: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const currentUser = userName;
  const encodedUserName = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userName));
  const encodedUserNameInPostShare = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(postShare?.account?.username));

  const fetchLikeAccounts = async () => {
    try {
      if (!likes && likes.length <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Không có người thích!',
          showConfirmButton: true,
        });
      }
      const accounts = likes.map((like) => like.account); // Lấy danh sách các account
      setLikeAccounts(accounts);
      setShowLikesAccModal(true);
    } catch (error) {
      console.error("Error fetching like accounts:", error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Đã xảy ra lỗi khi hiển thị danh sách người thích.',
        showConfirmButton: true,
      });
    }
  };

  const [shareContent, setShareContent] = useState('');  // Nội dung chia sẻ
  const [isShareSubmitting, setIsShareSubmitting] = useState(false);  // Trạng thái khi gửi bài chia sẻ
  const [showShareModal, setShowShareModal] = useState(false); // State để quản lý modal chia sẻ

  // Mở modal chia sẻ
  const handleShowShareModal = () => setShowShareModal(true);

  // Đóng modal chia sẻ
  const handleCloseShareModal = () => setShowShareModal(false);

  // Hàm xử lý chia sẻ bài viết
  const handleSharePost = async () => {
    if (!content.trim()) {
      alert("Nội dung chia sẻ không thể để trống.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Lấy token từ localStorage hoặc cookie
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Vui lòng đăng nhập!");
        setIsSubmitting(false);
        return;
      }

      // Tạo dữ liệu gửi lên server
      const postData = {
        content: shareContent,
      };

      // Gửi request chia sẻ bài viết
      const response = await axios.post(`http://localhost:8080/api/post/sharePost?postId=${postId}`, postData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        alert("Chia sẻ bài viết thành công!");
        setShareContent("");  // Xóa nội dung sau khi chia sẻ thành công
        handleCloseShareModal();
      } else {
        alert("Có lỗi xảy ra khi chia sẻ bài viết.");
      }
    } catch (error) {
      console.error("Có lỗi khi gửi request:", error);
      alert("Có lỗi khi chia sẻ bài viết.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-3 mt-3 p-3 border shadow-sm card-post">
      <Card.Body>
        <Row>
          <Col xs={2}>
            <div className="imgAt">
              <img
                src={userImage || 'default-avatar.png'}
                alt="user-avatar"
                className="rounded-circle me-3 border-3 "
                style={{ width: '50px', height: '50px', marginRight: '10px', borderRadius: '50%' }}
              />
            </div>
          </Col>
          <Col xs={10}>
            <div>
              {/* {console.log(userName)}
            {console.log(currentUserName)} */}
              <Link
                key={userName}
                // to={userName === currentUserName ? '/user/profile' : `/profiles/${encodedUserName}`} // Điều hướng tùy thuộc vào người dùng
                className="text-decoration-none text-dark"
                onClick={handleClick.bind(this, encodedUserName)} // Kiểm tra sự kiện khi nhấn vào tên
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
                  className="custom-dropdown-toggle border-0 p-0 px-2 pt-2"
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
            <Col>{content}</Col>
            {/* Nếu có bài viết chia sẻ, hiển thị bài viết chia sẻ */}
            {postShare && postShare.content ? (
              <>
                <Card className="mb-2 p-3 shadow-sm border-1">
                  <Card.Body>
                    <Row>
                      <Col xs={2}>
                        <div className="imgAt">
                          <img
                            src={`http://localhost:8080/image/${postShare?.account?.avatar}` || 'default-avatar.png'}
                            alt="user-avatar"
                            className="rounded-circle me-3 border-3 "
                            style={{ width: '50px', height: '50px', marginRight: '10px', borderRadius: '50%' }}
                          />
                        </div>
                      </Col>
                      <Col xs={10}>
                        <div>
                          <Link
                            key={postShare?.account?.username}
                            // to={userName === currentUserName ? '/user/profile' : `/profiles/${encodedUserName}`} // Điều hướng tùy thuộc vào người dùng
                            className="text-decoration-none text-dark"
                            onClick={handleClick.bind(this, encodedUserNameInPostShare)} // Kiểm tra sự kiện khi nhấn vào tên
                          >
                          {console.log(encodedUserNameInPostShare, encodedUserName)}
                            <h5>{postShare.account.fullname}</h5>
                          </Link>
                          <p>{new Date(postShare.postDay).toLocaleString()}</p>
                        </div>

                        {/* Dropdown menu "⋮" */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            right: "10px",
                          }}
                        >
                        </div>
                      </Col>
                    </Row>
                    <p>{postShare?.content}</p>
                    <div className={`fb-post-images fb-images-${postShare?.postImages?.length || 0}`}>
                      {postShare?.postImages?.map((image, index) => (
                        <div key={index} className="fb-post-image-wrapper">
                          <img
                            src={`http://localhost:8080/image/${image?.nameImage}`}
                            alt={`Image ${index + 1}`}
                            className="fb-post-image"
                          />
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </>
            ) : (
              // Nếu không có bài viết chia sẻ, hiển thị bài viết bình thường
              <>
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
              </>
            )}
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>
            <div className="text-dark" onClick={() => fetchLikeAccounts()}>
              <FaThumbsUp /> {likes.length}
            </div>
          </Col>
        </Row>
        <hr />
        <Row className="text-center mt-3">
          <Col>
            <div
              variant="link"
              className="text-dark"
              onClick={handleLikePost}
            >
              <div style={{ color: liked ? 'dodgerBlue' : 'inherit' }}>
                <FaThumbsUp /> {liked ? 'Thích' : 'Thích'} ({likes.length})
              </div>

            </div>
          </Col>
          <Col>
            <div variant="link" className="text-dark" onClick={() => setShowCommentBox(!showCommentBox)}>
              <FaComment /> Bình luận
            </div>
          </Col>
          <Col>
            <div variant="link" className="text-dark" onClick={() => handleShowShareModal()}>
              <FaShare /> Chia sẻ
            </div>
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
                        flexDirection: 'column', // Chỉnh sửa thành dạng cột
                        justifyContent: 'flex-start',
                        padding: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {console.log(commentItem)}
                        {console.log(currentUser.username)}
                        <strong>{commentItem?.account?.fullname || 'Người dùng ẩn'}</strong>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {/* Kiểm tra nếu người dùng hiện tại là chủ sở hữu của bình luận */}
                          {currentUser2 === commentItem?.account?.username && (
                            <div>
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
                          )}
                        </div>
                      </div>
                      {isEditing === commentItem.id ? (
                        <textarea
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                          rows={3}
                          style={{
                            width: '100%',
                            marginTop: '10px',
                            resize: 'none',
                            padding: '5px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                          }}
                        />
                      ) : (
                        <span style={{ marginTop: '10px' }}>{commentItem.content}</span>
                      )}

                      {/* Nút Trả lời và Xem phản hồi */}
                      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <div
                          className="text-info"
                          onClick={() => handleReplyComment(commentItem.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          Xem phản hồi
                        </div>
                        <div
                          className="text-primary"
                          onClick={() => handleReplyClick(commentItem.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          Trả lời
                        </div>
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

                    {/* Hiển thị các phản hồi */}
                    {showReplies[commentItem.id] && responses[commentItem.id] && responses[commentItem.id].length > 0 && (
                      <div className="mt-2" style={{ paddingLeft: '20px' }}>
                        {responses[commentItem.id].map((response, idx) => (
                          <div key={idx} style={{ textAlign: 'left', marginBottom: '10px' }}>
                            <strong>{response?.account?.fullname || 'Người dùng ẩn'}:</strong>
                            {editingReplyId === response.id ? (
                              <textarea
                                value={editedReplyContent}
                                onChange={(e) => setEditedReplyContent(e.target.value)}
                                rows={2}
                                style={{
                                  width: '100%',
                                  resize: 'none',
                                  padding: '5px',
                                  borderRadius: '4px',
                                  border: '1px solid #ccc',
                                  marginTop: '5px',
                                  marginBottom: '5px',
                                }}
                              />
                            ) : (
                              <span style={{ marginLeft: '10px' }}>{response.content}</span>
                            )}
                            {console.log(currentUser2)
                            }
                            {currentUser2 === response?.account?.username && (<div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                              {editingReplyId === response.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleUpdateReply(response.id, editedReplyContent)}
                                    disabled={isSubmitting || !editedReplyContent.trim()}
                                  >
                                    Lưu
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => cancelEditReply()}
                                  >
                                    Hủy
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="warning"
                                  onClick={() => startEditReply(response.id, response.content)}
                                >
                                  Sửa
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeleteReply(response.id)}
                              >
                                Xóa
                              </Button>
                            </div>)}
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

        {/* Modal hiển thị danh sách người dùng đã thích bài viết */}
        <Modal show={showLikesAccModal} onHide={() => setShowLikesAccModal(false)} centered>
          <Modal.Body
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: likeAccounts.length <= 0 ? 'center' : '',
              justifyContent: likeAccounts.length <= 0 ? 'center' : 'flex-start',
            }}
          >
            {likeAccounts.length > 0 ? (
              <ListGroup>
                {likeAccounts.map((account) => (
                  <ListGroup.Item key={account.id} className="border-0">
                    {/* Hiển thị ảnh đại diện */}
                    <img
                      src={account?.avatar
                        ? `http://localhost:8080/image/${account.avatar}`
                        : "default-avatar.png"} // Đường dẫn ảnh đại diện hoặc ảnh mặc định
                      alt="avatar"
                      className="rounded-circle me-3"
                      style={{ width: '40px', height: '40px' }}
                    />
                    {/* Hiển thị tên người dùng */}
                    <strong>{account.fullname}</strong>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p>Chưa có người dùng nào thích bài viết này.</p>
            )}
          </Modal.Body>
        </Modal>

        {/* Modal chia sẻ */}
        <Modal show={showShareModal} onHide={handleCloseShareModal}>
          <Modal.Header>
            {/* Hiển thị thông tin người dùng đã đăng nhập */}
            <div className="row w-100">
              {/* Cột thông tin người dùng */}
              <Col xs={12} className="mt-2">
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                  <img
                    src={accountLogin?.avatar
                      ? `http://localhost:8080/image/${accountLogin?.avatar}`
                      : "default-avatar.png"} // Đường dẫn ảnh đại diện hoặc ảnh mặc định
                    alt="avatar"
                    className="rounded-circle me-3"
                    style={{ width: '40px', height: '40px' }}
                  />
                  <strong>{accountLogin?.fullname || 'Người dùng ẩn'}</strong>
                </div>
              </Col>

              {/* Cột nhập nội dung chia sẻ */}
              <Form onSubmit={handleSharePost}>
                <Col xs={12} className="mt-2">
                  {/* Trường nhập nội dung chia sẻ */}
                  <Form.Group controlId="shareContent">
                    <Form.Label>Nội dung chia sẻ</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Thêm nội dung chia sẻ..."
                      value={shareContent}
                      onChange={(e) => setShareContent(e.target.value)} // Hàm thay đổi giá trị nội dung chia sẻ
                    />
                  </Form.Group>
                </Col>

                {/* Nút chia sẻ nằm bên phải */}
                <Col xs={12} className="mt-3 d-flex justify-content-end">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || !shareContent.trim()} // Vô hiệu nút chia sẻ nếu không có nội dung
                  >
                    {isSubmitting ? "Đang chia sẻ..." : "Chia sẻ"}
                  </Button>
                </Col>
              </Form>
            </div>
          </Modal.Header>

          <Modal.Body>
            <p>Chia sẻ bài viết này lên các mạng xã hội:</p>
            <Button variant="primary" className="mb-2 w-100">
              Chia sẻ lên Facebook
            </Button>
            <Button variant="info" className="mb-2 w-100">
              Chia sẻ lên Twitter
            </Button>
            {/* Thêm các nút chia sẻ khác nếu cần */}
          </Modal.Body>
        </Modal>

      </Card.Body>
    </Card>

  );
};

// Contacts Component
const Contacts = ({ username }) => {
  const [friends, setFriends] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Fetch danh sách bạn bè
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getAllFriendsByUsername(username);
        setFriends(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách bạn bè:", error);
      }
    };
    fetchFriends();
  }, [username]);

  // Fetch thông tin người dùng hiện tại
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("http://localhost:8080/api/account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response && response.data) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Xử lý click vào bạn bè
  const handleFriendClick = (friendUsername) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Gọi API backend để lấy thông tin current user
      fetch("http://localhost:8080/api/account", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              const currentUsername = data.username;

              // Điều hướng tùy vào người dùng hiện tại
              if (currentUsername === friendUsername) {
                navigate("/user/profile");
              } else {
                const encodedUsername = CryptoJS.enc.Base64.stringify(
                  CryptoJS.enc.Utf8.parse(friendUsername)
                );
                navigate(`/profiles/${encodedUsername}`);
              }
            });
          } else {
            throw new Error("Lỗi khi lấy thông tin người dùng hiện tại");
          }
        })
        .catch((error) => {
          console.error("Lỗi khi điều hướng:", error);
        });
    }
  };

  return (
    <div className="mt-3 p-3  shadow-sm contacts" style={{ backgroundColor: "#eee" }}>
      <Card.Title>Danh sách bạn bè</Card.Title>
      <ListGroup variant="flush">
        {friends.length === 0 ? (
          <ListGroup.Item>Không có bạn bè nào.</ListGroup.Item>
        ) : (
          friends.map((friend) => {
            const accountId2 = friend.accountId2 || {};
            const accountId1 = friend.accountId1 || {};
            const friendUsername =
              accountId2.username !== currentUser?.username
                ? accountId2.username
                : accountId1.username;

            const friendName =
              accountId2.username !== currentUser?.username
                ? accountId2.fullname
                : accountId1.fullname;

            const friendAvatar =
              accountId2.username !== currentUser?.username
                ? (accountId2.avatar ? `http://localhost:8080/image/${accountId2.avatar}` : "https://via.placeholder.com/150")
                : (accountId1.avatar ? `http://localhost:8080/image/${accountId1.avatar}` : "https://via.placeholder.com/150");
            return (
              <ListGroup.Item
                key={friend.id}
                className="d-flex align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => handleFriendClick(friendUsername)}
              >
                <Image
                  src={friendAvatar || "https://via.placeholder.com/150"}
                  roundedCircle
                  className="me-3"
                  style={{ width: "50px", height: "50px" }}
                />
                <div className="flex-grow-1">
                  <div>{friendName}</div>
                </div>
              </ListGroup.Item>
            );
          })
        )}
      </ListGroup>
    </div>
  );
};

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
      <Col md={3} >
        <Contacts />
      </Col>
    </Row>
  </Container>

);

export default HomePage;
