import axios from 'axios';

// Định nghĩa URL cơ sở của API
const API_URL = 'http://localhost:8080/api/seller/bill';
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Thêm interceptor để tự động thêm JWT vào các yêu cầu
axiosInstance.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem('token'); // Lấy token từ localStorage

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error) // Xử lý lỗi trong interceptor
);

// Lấy tất cả hóa đơn
export const getAllBills = async () => {
    try {
        const response = await axiosInstance.get('/getAll');
        return response.data;
    } catch (error) {
        console.error('Error fetching bills:', error);
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            // window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }
};

// Lấy hóa đơn theo shop
export const getBillsByShop = async () => {
    try {
        const response = await axiosInstance.get('/getBillByShop');
        return response.data;
    } catch (error) {
        console.error('Error fetching bills by shop:', error);
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            // window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }
};

// Xác nhận hóa đơn
export const confirmBill = async (id) => {
    try {
        const response = await axiosInstance.put('/confirmBill', null, {
            params: { id: String(id) },
        });
        return response.data;
    } catch (error) {
        console.error('Error confirming bill:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            // window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }
};

// Hủy hóa đơn
export const cancelBill = async (id) => {
    try {
        const response = await axiosInstance.put('/cancelBill', null, {
            params: { id: String(id) },
        });
        return response.data;
    } catch (error) {
        console.error('Error canceling bill:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            // window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }
};

export default {
    getBillsByShop,
    confirmBill,
    cancelBill,
};