import React, { useState, useEffect } from "react";
import { Client as TwilioChatClient } from "twilio-chat";
import axios from "axios";

const ChatApp = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    // Kiểm tra nếu token đã được lưu trong localStorage
    let token = localStorage.getItem("twilio_token");

    if (!token) {
      // Nếu chưa có token trong localStorage, gọi backend để lấy token
      axios
        .get(`http://localhost:8080/api/chat/token?identity=${username}`)
        .then((response) => {
          token = response.data;

          // Lưu token vào localStorage
          localStorage.setItem("twilio_token", token);

          // Thêm token vào header của các yêu cầu API
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Kết nối Twilio Chat Client
          initializeChatClient(token);
        })
        .catch((error) => {
          console.error("Error fetching token:", error);
        });
    } else {
      // Nếu có token trong localStorage, sử dụng ngay
      // Thêm token vào header của các yêu cầu API
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      initializeChatClient(token);
    }
  }, [username]);

  const initializeChatClient = (token) => {
    // Khởi tạo Twilio Chat Client
    TwilioChatClient.create(token)
      .then((client) => {
        if (!client) {
          throw new Error("Twilio Chat Client initialization failed");
        }
        setChatClient(client);
  
        // Lấy channel "general" hoặc tạo channel mới
        return client.getChannelByUniqueName("1");
      })
      .then((existingChannel) => {
        if (existingChannel) {
          // Nếu channel đã tồn tại, tham gia vào channel đó
          setChannel(existingChannel);
          return existingChannel.join();
        } else {
          // Nếu không có channel, tạo mới một channel
          return chatClient.createChannel({
            uniqueName: "1",
            friendlyName: "1 Chat",
          });
        }
      })
      .then((joinedChannel) => {
        // Sau khi tham gia hoặc tạo channel mới, thiết lập channel
        setChannel(joinedChannel);
        console.log("Joined channel successfully");
      })
      .catch((error) => {
        console.error("Error joining or creating channel:", error);
      });
  };
  

  const sendMessage = () => {
    if (channel && message.trim() !== "") {
      // Gửi tin nhắn nếu có message và channel hợp lệ
      channel.sendMessage(message);
      setMessage(""); // Làm sạch trường nhập tin nhắn
    }
  };

  useEffect(() => {
    if (channel) {
      // Lắng nghe các tin nhắn mới được thêm vào channel
      channel.on("messageAdded", (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });
    }
  }, [channel]);

  return (
    <div>
      <h1>Chat Room</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <b>{msg.author}:</b> {msg.body}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatApp;
