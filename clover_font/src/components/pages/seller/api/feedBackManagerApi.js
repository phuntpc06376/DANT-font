import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/seller/evaluate';

// Lấy danh sách đánh giá theo shop
export const getEvaluateByShop = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/getEvaluateByShop`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Thay đổi token nếu cần
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching evaluations by shop:', error);
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      // window.location.href = '/error/403';
  }
  throw error; // Ném lỗi để xử lý ở nơi gọi
  }
};
