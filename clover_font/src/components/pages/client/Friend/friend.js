import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Nav, Form, FormControl, Button, Card, ListGroup, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import Swal from "sweetalert2";
// import './index.css';
import { acceptFriend, getAllFriendsByUsernameToConfirm } from "../services/friend_service.js";
import { deleteFriend } from '../services/friend_service.js';
import { addToFriend } from '../services/friend_service.js';
import { getAllFriendsByUsername } from '../services/friend_service.js';

  const FriendRequests = ({ username }) => {
    // const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
     const [friends, setFriends] = useState([]);
 const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
 
useEffect(() => {
  const fetchRequests = async () => {
      try {
          console.log("Gọi API với username:", username);  // Kiểm tra giá trị username
          const data = await getAllFriendsByUsernameToConfirm(username);
          console.log("Dữ liệu từ API:", data);
          if (data && Array.isArray(data)) {
              const pendingRequests = data.filter(request => request.status === false);
              setFriends(pendingRequests);
          } else {
              setError("Không có yêu cầu kết bạn.");
          }
      } catch (err) {
          console.error("Lỗi khi tải yêu cầu kết bạn:", err);
          setError("Lỗi khi tải yêu cầu kết bạn.");
      }
  };

  fetchRequests();
}, [username]);


if (loading) return <p>Đang tải danh sách kết bạn...</p>;

// Hàm xử lý yêu cầu chấp nhận
const handleAcceptRequest = async (id) => {
  try {
    setLoading(true);
    const updatedFriend = await acceptFriend(id); // Gọi API chấp nhận bạn bè
    setFriends((prevFriends) => //cập nhật lại danh sách 
      prevFriends.map((friend) =>
        friend.id === id ? { ...friend, status: true } : friend  // Cập nhật trạng thái friend
      )
    );

    Swal.fire('Thành công', 'Yêu cầu kết bạn đã được chấp nhận', 'success');  // Thông báo thành công
  } catch (err) {
    setError(err.message);  // Ghi lại lỗi khi chấp nhận bạn bè thất bại
  } finally {
    setLoading(false);
  }
}
const handleRejectRequest = async (friendId) => {
    try {
        setLoading(true);
        await deleteFriend(friendId);  // Gọi API xóa bạn bè
        setFriends(friends.filter((friend) => friend.accountId1.id !== friendId));  // Xóa bạn bè bị từ chối khỏi danh sách
    } catch (err) {
        setError("Không thể xóa yêu cầu kết bạn.");
    } finally {
        setLoading(false);
    }
};
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
  const handleButtonClick = (event) => {
    event.stopPropagation(); // Ngừng sự kiện lan ra ngoài
    // Thực hiện các hành động với nút tại đây
};

return (
    <Container style={styles.orderSummaryContainer}>
    <h2 style={styles.orderSummaryTitle}>Lời mời kết bạn</h2>
    {error && <p style={{ color: "red" }}>{error}</p>}
    {loading && <p>Đang tải danh sách kết bạn...</p>}
    {friends.length === 0 ? (
        <p>Không có yêu cầu kết bạn nào.</p>
    ) : (
        <div style={styles.requestList}>
            {friends.map((friend) => (
               

                <div key={friend.id} style={styles.requestCard} 
                onClick={() => handleFriendClick(friend.accountId1.username)}
                >
                    <div style={styles.cardContent}>  
                        <img 
                            src={friend.accountId1.avatar ? `http://localhost:8080/image/${friend.accountId1.avatar}` : "https://via.placeholder.com/150"} 
                            alt={friend.username} 
                            style={styles.avatar}
                        />                   
                        <div style={styles.userInfo}>
                            <p style={styles.userName}>{friend.accountId1.fullname}</p>
                        </div>
                    </div>
                    <div style={styles.buttons}>
                        {friend.status === false ? (
                            <>
                                <button
                                 onClick={(event) => { 
                                    handleButtonClick(event); 
                                    handleAcceptRequest(friend.id); 
                                }}
                                    // onClick={() => handleAcceptRequest(friend.id)}
                                    style={styles.acceptButton}
                                    disabled={loading}
                                >
                                    {loading ? "Đang xử lý..." : "Xác nhận"}
                                </button>
                                <button
                                   onClick={(event) => { 
                                    handleButtonClick(event); 
                                    handleRejectRequest(friend.accountId1.id); 
                                }}
                                    // onClick={() => handleRejectRequest(friend.accountId1.id)}
                                    style={styles.rejectButton}
                                    disabled={loading}
                                >
                                    Từ chối
                                </button>
                            </>
                        ) : (
                            <p style={styles.statusText}>Đã là bạn bè</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )}
  </Container>
);
  }

  const styles = {
    orderSummaryContainer: {
        margin: '2rem auto',
        padding: '1.5rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        maxWidth: '1200px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    orderSummaryTitle: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '1.5rem',
        textAlign: 'center',
    },
    requestList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', // Tạo 3 cột đều
        gap: '15px', // Khoảng cách giữa các phần tử
        width: '100%',
        maxWidth: '1200px',
    },
    requestCard: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        textAlign: 'left',
        transition: 'transform 0.3s ease',
        fontFamily: 'Arial, sans-serif',
        cursor: 'pointer', 
    },
    cardContent: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
    },
    avatar: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        marginRight: '15px',
    },
    userInfo: {
        textAlign: 'left',
    },
    userName: {
        fontWeight: 'bold',
        fontSize: '16px',
        marginBottom: '5px',
      
    },
    buttons: {
        marginTop: '15px',
        display: 'flex',
        justifyContent: 'space-between',
    },
    acceptButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '48%',
        transition: 'background-color 0.3s',
        fontSize: '14px',
    },
    rejectButton: {
        backgroundColor: '#ccc',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '48%',
        transition: 'background-color 0.3s',
        fontSize: '14px',
    },
    statusText: {
        fontSize: '14px',
        color: '#28a745',
        
    },
};

// Styles hover effect for buttons
styles.acceptButton[':hover'] = {
    backgroundColor: '#0056b3',
};

styles.rejectButton[':hover'] = {
    backgroundColor: '#999',
};




export default FriendRequests;
