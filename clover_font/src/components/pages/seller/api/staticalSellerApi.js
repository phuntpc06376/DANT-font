import axios from 'axios';

// Địa chỉ API
const API_URL = 'http://localhost:8080/api/staticalSeller';

// Tạo instance Axios với cấu hình cơ bản
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Thêm interceptor để tự động thêm JWT vào các yêu cầu
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Thêm token vào header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Hàm gọi API để lấy danh sách Statical Sellers
export const getAllStaticalSellers = async (startDate, endDate, shopId) => {
    try {
        const response = await axiosInstance.post('', {
            startDate,
            endDate,
            shopId,
        });
        return response.data; // Trả về dữ liệu nhận được
    } catch (error) {
        console.error('Lỗi khi gọi API:', error); // Ghi log lỗi
        throw error; // Ném lỗi lên để xử lý ở nơi gọi
    }
};
