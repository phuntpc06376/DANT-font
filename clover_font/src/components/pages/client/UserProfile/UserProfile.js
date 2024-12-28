import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import CryptoJS from 'crypto-js';
import "./Profile.css";
import ChatApp from "../chat/chat";
import { Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { acceptFriend, getAllFriendsByUsernameToConfirm } from "../services/friend_service.js";
import { deleteFriend } from '../services/friend_service.js';
import { addToFriend } from '../services/friend_service.js';
import { getAllFriendsByUsername } from '../services/friend_service.js';
import { Container, Row, Col, Nav, Form, FormControl, Button, Card, ListGroup, Image, Dropdown, Modal } from 'react-bootstrap';
import { FaUserFriends, FaSave, FaStore, FaThumbsUp, FaComment, FaShare, FaTrash, FaEdit, FaReply } from 'react-icons/fa';
const UserProfile = () => {
  const { userName } = useParams(); // Lấy username từ URL params
  const decodedUserName = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(userName));
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (!storedToken) {
      setError("Authorization token is missing.");
    }
    const fetchCurrentUser = async () => {

    }
    fetchCurrentUser();
  }, []);

  // Lấy thông tin hồ sơ người dùng
  useEffect(() => {
    if (!token) return;

    const fetchProfileData = async () => {
      try {
        const currentUser1 = await axios.get('http://localhost:8080/api/account', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        console.log(currentUser1.data);
        setCurrentUser(currentUser1.data);


        const response = await fetch(
          `http://localhost:8080/api/account/getByUsername?username=${decodedUserName}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setProfileData(data);
        console.log(currentUser1);
        if (((data.friend1s && Array.isArray(data.friend1s)) || (data.friend2s && Array.isArray(data.friend2s))) && currentUser1.data) {

          const isFriend1 = data.friend1s.some(
            (f) =>
              (f.accountId2.id === currentUser1.data.id && f.status === true) || (f.accountId1.id === currentUser1.data.id && f.status === true)
          );
          const isFriend2 = data.friend2s.some(
            (f) => (f.accountId2.id === currentUser1.data.id && f.status === true) || (f.accountId1.id === currentUser1.data.id && f.status === true)

          );
          console.log(isFriend1);
          console.log(isFriend2);

          if (isFriend1) {
            setIsFriend(isFriend1);
          }
          if (isFriend2) {
            setIsFriend(isFriend2);
          }

        }
      } catch (error) {
        setError(`Error fetching user profile: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userName, token]);
  //Lấy bài đăng của người dùng


  const MainContent = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [currentUser2, setCurrentUser2] = useState("");


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
        const response = await fetch(`http://localhost:8080/api/post/getByUsername?username=${decodedUserName}`, { // Sử dụng dấu nháy ngược ``
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
              .sort((a, b) => new Date(b.postDay) - new Date(a.postDay)) // Sắp xếp bài viết theo ngày
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
  const Post = ({ currentUserName, postId, userImage, userName, timeStamp, content, likes,
    initialComments, accountId, onPostDeleted, fetchPosts, userFullname, Img, currentUser2 }) => {
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
    const [editingReplyId, setEditingReplyId] = useState(null); // ID phản hồi đang chỉnh sửa
    const [editedReplyContent, setEditedReplyContent] = useState(''); // Nội dung mới



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
        console.log(response)
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
                          flexDirection: 'column', // Chỉnh sửa thành dạng cột
                          justifyContent: 'flex-start',
                          padding: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          {(currentUser.username)}
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


        </Card.Body>
      </Card>

    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/sell/product/getShopByUsername?username=${decodedUserName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Log the response for debugging
        console.log("Products API response:", response);

        // Safely access products field
        const productsData = response.data?.products ?? []; // Fallback to an empty array if products is undefined
        setProducts(productsData);

      } catch (error) {
        console.error("Có lỗi khi tải sản phẩm:", error.message);
        setProducts([]); // Ensure state is updated to avoid undefined errors
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [decodedUserName, token]);

  //Lấy bạn bè từ người dùng
  useEffect(() => {
    if (!token) return;

    const fetchFriends = async () => {
      try {
        const tokenCurentUser = localStorage.getItem('token');
        const currentUser = await axios.get('http://localhost:8080/api/account', {
          headers: {
            Authorization: `Bearer ${tokenCurentUser}`,
          }
        });
        const response = await fetch(
          `http://localhost:8080/api/friend/getFriendByUsernameToConfirm?username=${decodedUserName}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Error fetching friends: ${response.status}`);
        }
        const data = await response.json();
        console.log('Friends data:', data);  // Thêm dòng này để kiểm tra phản hồi từ server
        setFriends(Array.isArray(data) ? data : []);  // Đảm bảo rằng dữ liệu trả về là một mảng
      } catch (error) {
        setError(`Error fetching posts: ${error.message}`);
        // setFriends([]); // Ensure state is updated to avoid undefined errors
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [decodedUserName, token]);



  useEffect(() => {
    if (!decodedUserName) return;

    const fetchFriends = async () => {
      try {

        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:8080/api/friend/getFriendByUsernameOtherUser?username=${decodedUserName}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching friends: ${response.status}`);
        }

        const data = await response.json();
        setFriends(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(`Error fetching friends: ${error.message}`);
      }
    };

    fetchFriends();
  }, [decodedUserName]);





  //đường dẫn đến chhi tiết sản phẩm
  const navigate = useNavigate();
  const handleCardClick = (id) => {
    navigate(`/user/product/${id}`);
  };

  //phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Số sản phẩm trên mỗi trang
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginateProducts = (products) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  // load bạn bè người dùng đang có



  const handleAddFriend = async (accountId2) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("accountId2", accountId2);

      const response = await addToFriend(formData);

      if (response) {
        Swal.fire("Thành công!", "Thêm bạn bè thành công.", "success");
        setIsRequestSent(true);
      } else {
        Swal.fire("Thất bại!", "Đã là bạn bè hoặc lỗi xảy ra.", "error");
      }
    } catch (error) {
      console.error("Lỗi thêm bạn:", error);
      Swal.fire("Thất bại!", "Thêm bạn bè thất bại.", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteFriend = async (friendId) => {
    setLoading(true); // Hiển thị trạng thái loading
    try {
      const response = await deleteFriend(friendId); // Gọi API xóa bạn bè

      if (response.status === "true") {
        Swal.fire("Thành công!", "Xóa bạn bè thành công.", "success");
        setIsFriend(false); // Cập nhật trạng thái là không còn bạn bè
      } else {
        Swal.fire("Thất bại!", "Không thể xóa bạn bè hoặc lỗi xảy ra.", "error");
      }
    } catch (error) {
      console.error("Lỗi xóa bạn:", error);
      Swal.fire("Thất bại!", "Xóa bạn bè thất bại.", "error");
    } finally {
      setLoading(false); // Kết thúc trạng thái loading
    }
  };




  const paginateFriends = (friends) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return friends.slice(startIndex, endIndex);
  };
  const chatMessage = async () => {
    try {
      const tokenCurentUser = localStorage.getItem('token');

      // Set trạng thái tải là true khi bắt đầu gửi yêu cầu
      setIsLoading(true);

      const response = await axios.post('http://localhost:8080/twilio/create-channel/new-user', {
        userIdOne: currentUser.id,
        nameOne: currentUser.fullname,
        userIdTwo: profileData.id,
        nameTwo: profileData.fullname
      }, {
        headers: {
          Authorization: `Bearer ${tokenCurentUser}`,
        },
      });

      console.log("Response from chat API:", response.data);

      if (response.status) {
        navigate('/user/chat');
      } else {
        alert('Có lỗi khi tạo kênh chat');
      }
    } catch (error) {
      alert('Có lỗi khi tạo kênh chat');
      console.error("Error sending chat message:", error.message);
    } finally {
      // Đặt lại trạng thái tải thành false sau khi yêu cầu hoàn tất
      setIsLoading(false);
    }
  };





  return (
    <div className="profile-container">
      {/* Cover Section */}
      <div className="cover-section">
        <div className="avatar">
          {profileData ? (
            <img
              className="avatar-img"
              src={
                profileData.avatar
                  ? `http://localhost:8080/image/${profileData.avatar}`
                  : "https://via.placeholder.com/100"
              }
              alt="Avatar"
            />
          ) : (
            <img
              className="avatar-img"
              src="https://via.placeholder.com/100"
              alt="Default Avatar"
            />
          )}
        </div>


      </div>
      {/* Profile Info */}
      <div className="profile-info ">
        <h2 className="profile-name">{profileData.fullname || "User"}</h2>
        <p className="profile-email">Email: {profileData.email || "N/A"}</p>
        <div className="d-inline button-container">
          {profileData.id !== currentUser.id && (
            <>
              {!isFriend ? (
                <button
                  onClick={() => handleAddFriend(profileData.id)}
                  className="btn btn-primary me-2" // Thêm lớp Bootstrap
                  disabled={loading}
                >
                  Kết bạn
                </button>
              ) : (
                <button
                  onClick={() => handleDeleteFriend(profileData.id)}
                  className="btn btn-primary me-2" // Thêm lớp Bootstrap
                  disabled={loading}
                >
                  Hủy kết bạn
                </button>
              )}
            </>
          )}

          {currentUser.id !== profileData.id && (
            <button
              onClick={chatMessage}
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Nhắn tin"
              )}
            </button>
          )}
        </div>
      </div>
      {/* About Section */}
      {/* <div className="about-section">
        <h3 className="about-title">About</h3>
        <p className="about-text">{profileData.about || "This user has no bio yet."}</p>
      </div> */}
      {/* Post List Section */}
      <Tabs
        defaultActiveKey="profile"
        id="uncontrolled-tab-example"
        className="mb-3 mt-3"
      >
        <Tab eventKey="profile" title="Bài đăng " className="mt-3">

          <MainContent />
        </Tab>
        <Tab eventKey="store" title="Cửa hàng" className="text-center">
          <div className="product-grid">
            {loading ? (
              <p>Đang tải...</p>
            ) : products.length > 0 ? ( // Ensure products is always an array
              paginateProducts(products).map((prod) => (
                <div
                  key={prod.id}
                  className="product-card"
                  onClick={() => handleCardClick(prod.id)}
                >
                  <img
                    src={prod.prodImages ? `http://localhost:8080/image/${prod.prodImages[0]?.name}` : "https://via.placeholder.com/250"}
                    alt={prod.name}
                    style={{
                      width: '250px',
                      height: '250px',
                      objectFit: 'cover',
                      borderRadius: '8px', // Optional: Bo góc nếu cần
                    }}
                  />

                  <div className="product-content mt-3">
                    <h5 className="product-title">{prod.name}</h5>
                    <p className="product-description">{prod.description}</p>
                    <p className="product-price">
                      {prod.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </p>

                  </div>
                </div>
              ))
            ) : (
              <p>Không có sản phẩm nào.</p>
            )}
            {/* Pagination Controls */}
            {/* Pagination Controls */}
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={currentPage === index + 1 ? "active" : ""}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>

          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default UserProfile;
