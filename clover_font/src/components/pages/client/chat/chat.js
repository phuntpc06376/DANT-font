import React, { useRef, useState, useEffect } from "react";
import { Client, Client as TwilioChatClient } from "twilio-chat";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemButton,
  Avatar,
} from "@mui/material";

const ChatApp = () => {
  const [chatClient, setChatClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [currentChannel, setCurrentChannel] = useState(null);
  const [channel, setChannel] = useState([]);
  const [user, setUser] = useState(null);
  const [user2, setUser2] = useState(null);


  // Function to fetch Twilio token

  const getToken = async () => {
    try {
      // getProfile
      const token = localStorage.getItem("token");
      const decodedToken = token ? jwtDecode(token) : null; // Giải mã token
      const username = decodedToken?.sub;

      const responseProfile = await axios.get(
        "http://localhost:8080/api/account/getByUsername",
        {
          params: { username },
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );

      const response = await axios.post(
        "http://localhost:8080/twilio/register",
        {
          userId: /*"1234m5",*/ responseProfile.data.id,
          name: /*"te",*/ responseProfile.data.fullname,
        }
      );
      console.log(response.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching Twilio token:", error);
      throw error;
    }
  };

  // Initialize Chat Client
  useEffect(() => {
    const initializeChat = async () => {
      console.log(currentChannel);

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const userData = await axios.get("http://localhost:8080/api/account", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(userData.data);
        initializeChatClient(userData.data);
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();
  }, []);

  const initializeChatClient = async (user) => {
    try {
      if (!user || !user.id) {
        console.error("User data is incomplete.");
        return;
      }

      const token = await getToken();
      const client = new TwilioChatClient(token);

      client.on("stateChanged", async (state) => {
        if (state === "initialized") {
          const channels = await client.getSubscribedChannels();
          setChannel(channels.items);
        }
      });
    } catch (error) {
      console.error("Error initializing Twilio client:", error);
    }
  };

  const selectChannel = async (channel) => {
    if (!channel) return;

    // Gỡ listener khỏi kênh cũ
    currentChannel?.removeAllListeners("messageAdded");

    // Cập nhật kênh hiện tại
    setCurrentChannel(channel);

    // Lấy tin nhắn ban đầu
    const messages = await channel.getMessages();
    setMessages(messages.items);
    try {
      const members = await channel.getMembers();

      for (const member of members) {
        if (member.identity !== user.id + "") {

          console.log(member.identity);

          const fetchedUser = await getAuthorInfor(member.identity); // Lấy dữ liệu từ API
          if (fetchedUser) {
            console.log(fetchedUser);

            setUser2(fetchedUser); // Cập nhật trạng thái user2
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thành viên:", error);
    }

    // Lắng nghe tin nhắn mới từ kênh
    channel.on("messageAdded", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  };

  const sendMessages = async (channel, message, e) => {
    e.preventDefault();
    if (channel && message.trim() !== "") {
      try {
        await channel.sendMessage(message);
        setMessageText(""); // Xóa nội dung input sau khi gửi
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.error("No channel or empty message.");
    }
  };


  // Send message
  // const sendMessage = async () => {
  //   if (messageText.trim() && currentChannel) {
  //     try {
  //       await currentChannel.sendMessage(messageText, {
  //         id: profile?.username,
  //         uid: profile?.id,
  //         name: profile?.name,
  //       });
  //       setMessageText("");
  //     } catch (error) {
  //       console.error("Error sending message:", error);
  //     }
  //   }
  // };
  // Hàm để tách chuỗi `channel.friendlyName` thành các phần
  const parseChannelName = (channel, currentUserId) => {
    console.log(currentUserId);

    // Tách chuỗi theo dấu gạch ngang
    const parts = channel.friendlyName.split("-");
    // Lọc ra phần không khớp với currentUserId
    console.log(parts);

    const otherUserName = parts.find((part) => part.trim() !== currentUserId);
    console.log(otherUserName);

    // Trả về tên người dùng không phải user hiện tại
    return otherUserName || "Unknown User"; // Trả về "Unknown User" nếu không tìm thấy
  };
  // Hàm định dạng ngày giờ
  const formatDate = (date) => {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return new Date(date).toLocaleString("vi-VN", options);
  };
  const getAuthorInfor = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const responseProfile = await axios.get(
        "http://localhost:8080/api/account/getById",
        {
          params: { id },
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );
      if (responseProfile.data) {
        setUser2(responseProfile.data); // Cập nhật user2 với dữ liệu trả về
      }
    } catch (error) {
      console.error("Error fetching user information:", error);
    }
  };

  const getImage = (id) => { };
  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "88vh" }}>
      {/* Danh sách kênh bên trái có thể cuộn */}
      <Box
        sx={{
          width: { xs: "0", sm: "300px" }, // Ẩn danh sách kênh khi màn hình nhỏ
          backgroundColor: "#f4f4f4",
          padding: "10px",
          borderRight: "1px solid #ddd",
          overflowY: "auto", // Cho phép cuộn danh sách kênh
          height: "88vh", // Đảm bảo chiều cao danh sách kênh chiếm toàn bộ chiều cao màn hình
        }}
      >
        <Typography variant="h6" className="text-center" sx={{ marginBottom: "10px" }}>
          Đoạn chat
        </Typography>
        <List>
          {channel.map((channel) => {
            const parsedName = parseChannelName(channel, user.fullname);
            const image = getImage(channel);
            const imageUrl =
              "http://localhost:8080/api/image/1734005448769.jpg"; // Đặt URL hình ảnh đại diện cho kênh (hoặc sử dụng từ dữ liệu kênh)

            console.log(channel);

            // Chuyển đổi Map thành mảng và tìm thành viên
            const memberArray = Array.from(channel.members); // Hoặc [...channel.members]

            return (
              <ListItem key={channel.sid}>
                <ListItemButton onClick={() => selectChannel(channel)}>
                  {/* Hiển thị hình ảnh đại diện cho kênh */}
                  <Avatar
                    src={imageUrl}
                    alt={channel.friendlyName}
                    sx={{ marginRight: 2 }}
                  />
                  <ListItemText
                    primary={
                      <Box>
                        {/* Hiển thị phần chuỗi đã tách */}
                        {parsedName}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Chat messages */}
      {currentChannel && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "88vh",
          }}
        >
          <Paper
            sx={{
              flex: 1,
              overflowY: "auto",
              margin: "10px",
              padding: "10px",
              maxHeight: "80vh",
            }}
          >
            <List>
              {messages.map((msg, index) => (
                <div key={index}>
                  <ListItem
                    sx={{
                      justifyContent:
                        msg.author === user.id + "" ? "flex-end" : "flex-start", // Điều chỉnh vị trí
                      alignItems: "flex-start", // Đảm bảo các tin nhắn căn chỉnh đúng
                      textAlign: msg.author === user.id + "" ? "right" : "left", // Đảo ngược văn bản
                    }}
                  >
                    <ListItemText
                      primary={
                        // Sửa lại phần hiển thị tên người gửi tin nhắn
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{ display: "inline" }}
                        >
                          {msg.author === user.id + ""
                            ? user.fullname
                            : user2
                              ? user2.fullname
                              : "Unknown User"}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          {/* 
            Hyper link share (Demo) trong a , khi share gửi đường dẫn bài viết (Chi tiết bài viết) 
            gửi vào body channel khi hiện kiểm tra http hoặc https để vào thẻ a vào herf là nội dung của body (Font)
         */}
                          {/* <Typography variant="body2">{msg.body}</Typography> */}
                          <Typography variant="body2">
                            {msg.body && (msg.body.startsWith("http") ? (
                              <a href={msg.body} target="_blank" rel="noopener noreferrer">
                                {msg.body}
                              </a>
                            ) : (
                              msg.body
                            ))}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{ marginTop: 1, fontSize: "0.65em" }}
                          >
                            {formatDate(msg.dateCreated)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < messages.length - 1 && <Divider />}
                </div>
              ))}

            </List>
          </Paper>

          {/* Message input */}
          <Box
            sx={{
              display: "flex",
              padding: "10px",
              backgroundColor: "#f0f0f0",
            }}
          >
            <TextField
              variant="outlined"
              fullWidth
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              sx={{ marginRight: "10px" }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => sendMessages(currentChannel, messageText, e)}
              disabled={!messageText.trim()}
            >
              Gửi
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChatApp;
