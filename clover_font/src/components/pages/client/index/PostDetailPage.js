import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Nav, Form, FormControl, Button, Card, ListGroup, Image, Dropdown, Modal } from 'react-bootstrap';
import { FaUserFriends, FaSave, FaStore, FaThumbsUp, FaComment, FaShare, FaTrash, FaEdit, FaReply } from 'react-icons/fa';
import { FaCartShopping } from "react-icons/fa6";
import { RiBillLine } from "react-icons/ri";
import { Link, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import Swal from "sweetalert2";
import axios from 'axios';
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import './index.css';
import { Carousel } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';



// Import Post nếu chưa import

const MainContent = () => {
    const [posts, setPosts] = useState([]);  // Để lưu bài viết
    const [loading, setLoading] = useState(true);  // Trạng thái tải bài viết
    const [currentUser2, setCurrentUser2] = useState("");
    const { postId } = useParams();  // Lấy postId từ URL params
    const [postData, setPostData] = useState(null);  // Dữ liệu bài viết riêng biệt

    useEffect(() => {
        if (postId) {  // Chỉ gọi khi postId có giá trị
            fetchPosts(postId);  // Gọi API lấy bài viết chi tiết
        }
    }, [postId]);  // Chạy lại khi postId thay đổi

    const fetchPosts = async (postId) => {
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
            const response = await fetch(`http://localhost:8080/api/post/getById?id=${postId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,  // Gửi token trong header
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);  // Kiểm tra lỗi
            }

            const data = await response.json();  // Lấy dữ liệu bài viết
            if (data) {
                setPostData(data);  // Lưu bài viết vào state
            } else {
                console.error("Post not found");
            }
        } catch (error) {
            console.error("Error fetching post:", error);
        } finally {
            setLoading(false);  // Cập nhật trạng thái khi fetching hoàn tất
        }
    };

    const handlePostDeleted = (postId) => {
        // Sau khi xóa bài viết, gọi lại fetchPosts để tải lại dữ liệu bài viết
        setPosts(posts.filter(post => post.id !== postId));  // Xóa bài viết khỏi danh sách
        fetchPosts(postId);  // Gọi lại fetchPosts để cập nhật lại dữ liệu bài viết
    };

    return (
        <div>
            {
                loading ? (
                    <p>Loading...</p>
                ) : postData ? (  // Hiển thị bài viết chi tiết bằng Post component
                    <Post
                        key={postData.id}
                        postId={postData.id}
                        userImage={postData?.account?.avatar ? `http://localhost:8080/image/${postData.account.avatar}` : "default-avatar.png"}
                        currentUser2={currentUser2.username}
                        userName={postData?.account?.username || "Unknown User"}
                        userFullname={postData?.account?.fullname}
                        timeStamp={new Date(postData.postDay).toLocaleString()}
                        Img={postData?.postImages}
                        content={postData.content}
                        likes={postData.likes || []}
                        initialComments={postData.comments || []}
                        accountId={postData.account.id}  // Đảm bảo đây là đúng
                        onPostDeleted={handlePostDeleted}
                        fetchPosts={fetchPosts}
                    />
                ) : (
                    <p>Không tìm thấy bài viết.</p>  // Nếu không có bài viết chi tiết
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
    const [showCommentBox, setShowCommentBox] = useState(true);
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
                    if (postId) {  // Chỉ gọi khi postId có giá trị
                        fetchPosts(postId);  // Gọi API lấy bài viết chi tiết
                    }
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
                    if (postId) {  // Chỉ gọi khi postId có giá trị
                        fetchPosts(postId);  // Gọi API lấy bài viết chi tiết
                    }
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
                    if (postId) {  // Chỉ gọi khi postId có giá trị
                        fetchPosts(postId);  // Gọi API lấy bài viết chi tiết
                    } // Nếu cần cập nhật lại danh sách bài đăng và bình luận
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
                if (postId) {  // Chỉ gọi khi postId có giá trị
                    fetchPosts(postId);  // Gọi API lấy bài viết chi tiết
                }

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
    }, []);

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

        if (postId) {  // Chỉ gọi khi postId có giá trị
            fetchPosts(postId);  // Gọi API lấy bài viết chi tiết
        }

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
            if (postId) {  // Chỉ gọi khi postId có giá trị
                fetchPosts(postId);  // Gọi API lấy bài viết chi tiết
            }
        } catch (error) {
            console.error("Có lỗi xảy ra khi tải phản hồi:", error);
        } finally {
            setLoading(false); // Kết thúc loading
        }
    };


    const handleReplyClick = (commentId) => {
        setShowReplyForm((prevId) => (prevId === commentId ? null : commentId)); // Hiển thị/Ẩn form
        if (postId) {  // Chỉ gọi khi postId có giá trị
            fetchPosts(postId);  // Gọi API lấy bài viết chi tiết
        }
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
            if (postId) {  // Chỉ gọi khi postId có giá trị
                fetchPosts(postId);  // Gọi API lấy bài viết chi tiết
            }
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

            if (postId) {  // Chỉ gọi khi postId có giá trị
                fetchPosts(postId);  // Gọi API lấy bài viết chi tiết
            }

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
        <div className="custom-fb-post-container">
            <div className="custom-fb-post-container mt-3">
                <div className={`fb-custom-post-images fb-images-${Img.length}`}>
                    {Img.length > 1 ? (
                        <Carousel
                        
                            prevIcon={<FaArrowLeft size={30} />} // Custom left arrow
                            nextIcon={<FaArrowRight size={30} />} // Custom right arrow
                            prevLabel="Previous"
                            nextLabel="Next"
                        >
                            {Img.map((image, index) => (
                                <Carousel.Item key={index}>
                                    <div className="fb-custom-post-image-wrapper">
                                        <img
                                            src={`http://localhost:8080/image/${image?.nameImage}`}
                                            alt={`Image ${index + 1}`}
                                            className="fb-custom-post-image"
                                            style={{
                                                width: '800px',
                                                height: '600px',
                                                objectFit: 'cover',
                                                borderRadius: '10px',
                                            }}
                                        />
                                    </div>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    ) : (
                        Img.map((image, index) => (
                            <div key={index} className="fb-custom-post-image-wrapper">
                                <img
                                    src={`http://localhost:8080/image/${image?.nameImage}`}
                                    alt={`Image ${index + 1}`}
                                    className="fb-custom-post-image"
                                    style={{
                                        width: '800px',
                                        height: '600px',
                                        objectFit: 'cover',
                                        borderRadius: '10px',
                                    }}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>


            {/*  */}

            <div className="custom-fb-post-content mb-3 mt-3 p-3 border shadow-sm card-post">
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

                                {console.log(userName)
                                }
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
                </Card.Body>
            </div>
        </div>
    );
};





const PostDetailPage = () => (
    <Container fluid style={{ backgroundColor: "#eee" }}>



        <MainContent />


    </Container>

);


export default PostDetailPage;
