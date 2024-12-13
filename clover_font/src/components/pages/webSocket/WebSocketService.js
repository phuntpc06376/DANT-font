import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.productUpdateCallback = null;
  }

   // Kết nối WebSocket với token xác thực
   connect(token) {
    const socket = new SockJS('http://localhost:8080/ws');  // Endpoint WebSocket
    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,  // Gửi token xác thực nếu cần
      },
      debug: (str) => {
        console.log(str);
      },
      onConnect: () => {
        // Đăng ký nhận tin nhắn cập nhật sản phẩm từ server
        this.client.subscribe('/topic/products', (message) => {
          if (this.productUpdateCallback) {
            this.productUpdateCallback(message.body);
          }
        });
      },
      onWebSocketError: (error) => {
        console.error('Lỗi WebSocket:', error);
      },
    });

    this.client.activate();  // Kích hoạt kết nối STOMP
  }

  // Ngắt kết nối WebSocket
  disconnect() {
    if (this.client) {
      this.client.deactivate();  // Ngắt kết nối khi không cần nữa
    }
  }

  // Đặt callback để xử lý cập nhật sản phẩm
  onProductUpdate(callback) {
    this.productUpdateCallback = callback;
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
