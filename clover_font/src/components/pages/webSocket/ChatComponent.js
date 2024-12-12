import React, { useState, useEffect } from 'react';
import WebSocketService from './WebSocketService';

const ChatComponent = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Khi component mount, kết nối WebSocket
  useEffect(() => {
    WebSocketService.connect();

    // Clean up: Đảm bảo ngắt kết nối khi component unmount
    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  // Xử lý khi người dùng gửi tin nhắn
  const handleSendMessage = () => {
    if (message.trim()) {
      WebSocketService.sendMessage(message);
      setMessages([...messages, { sender: 'Me', message }]);
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Chat Room</h2>

      <div style={{ height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}: </strong>{msg.message}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message"
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;
