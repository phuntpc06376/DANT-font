import React, { useState, useEffect } from "react";
import { Client as TwilioChatClient } from "@twilio/conversations";
import axios from "axios";

const ChatApp = ({ userIdentity }) => {
  const [chatClient, setChatClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [currentChannel, setCurrentChannel] = useState(null);

  useEffect(() => {
    const initializeChatClient = async () => {
      try {
        // Lấy token từ localStorage
        let token = localStorage.getItem("twilioToken");
  
        if (!token) {
          // Nếu token không tồn tại, gọi API để lấy token mới
          const response = await axios.post(`http://localhost:8080/api/chat/token?identity=${userIdentity}`);
          token = response.data;
          localStorage.setItem("twilioToken", token);
        }
  
        // Khởi tạo Twilio Chat Client
        const client = new TwilioChatClient(token);
  
        // Lắng nghe các sự kiện từ client nếu cần
        client.on("stateChanged", (state) => console.log("Client state changed:", state));
  
        // Lưu trữ client vào state
        setChatClient(client);
      } catch (error) {
        console.error("Error initializing Twilio Chat Client:", error);
      }
    };
  
    initializeChatClient();
  }, [userIdentity]);



  useEffect(() => {
    if (chatClient) {
      // Lấy danh sách các cuộc trò chuyện đã đăng ký
      chatClient.getSubscribedConversations().then((conversationsPaginator) => {
        const conversations = conversationsPaginator.items;
        if (conversations.length > 0) {
          joinChannel(conversations[0]); // Vào kênh đầu tiên
        } else {
          console.log("No subscribed conversations.");
        }
      });
    }
  }, [chatClient]);

  const joinChannel = async (conversation) => {
    try {
      // Gia nhập kênh
      const joinedConversation = await conversation.join();
      setCurrentChannel(joinedConversation);

      // Lấy tin nhắn cũ
      const messagesPaginator = await joinedConversation.getMessages();
      setMessages(messagesPaginator.items);

      // Lắng nghe tin nhắn mới
      joinedConversation.on("messageAdded", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    } catch (error) {
      console.error("Error joining conversation:", error);
    }
  };


  const sendMessage = async () => {
    if (currentChannel && messageText.trim()) {
      await currentChannel.sendMessage(messageText);
      setMessageText("");
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.index} className="message">
            <strong>{msg.author}:</strong> {msg.body}
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatApp;
