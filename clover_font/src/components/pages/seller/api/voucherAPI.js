import axios from 'axios';

const API_URL = 'http://localhost:8080/api/seller/voucher';
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
    (error) => Promise.reject(error) // Xử lý lỗi khi thêm JWT
);

// API lấy tất cả voucher
export const getAllVouchers = async () => {
    const response = await axiosInstance.get();
    return response.data;
};

// API lấy voucher theo cửa hàng
export const getVouchersByShop = async () => {
    const response = await axiosInstance.get('/getVoucherByShop');
    return response.data;
};

// API tạo mới voucher
export const createVoucher = async (data) => {
    const response = await axiosInstance.post('/create', data);
    return response.data;
    };

// API cập nhật voucher
export const updateVoucher = async (id, data) => {
    const response = await axiosInstance.put('/update', { id, ...data }); // Gửi id kèm dữ liệu cập nhật
    return response.data;
};

// API xóa voucher
export const deleteVoucher = async (id) => {
    const response = await axiosInstance.delete('/delete', {
        params: { id }, // Gửi ID qua query param
    });
    return response.data;
};
