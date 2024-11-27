import axios from 'axios';

const API_URL = 'http://localhost:8080/api/properties';
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Thêm interceptor để tự động thêm JWT vào các yêu cầu
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Xử lý lỗi toàn cục
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        // Xử lý lỗi 401 Unauthorized
        if (status === 401) {
            console.warn('Token không hợp lệ hoặc đã hết hạn');
            // Có thể điều hướng người dùng đến trang đăng nhập
        }

        console.error(`Lỗi API (${status}): ${message}`);
        return Promise.reject(error);
    }
);

// Lấy tất cả tài sản
export const getAllProperties = async () => {
    const response = await axiosInstance.get();
    return response.data;
};

// Lấy tài sản theo ID
export const getPropertyById = async (id) => {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
};

// Tạo mới tài sản
export const createProperty = async (propertyBean) => {
    const response = await axiosInstance.post('', propertyBean);
    return response.data;
};

// Cập nhật tài sản
export const updateProperty = async (id, propertyBean) => {
    const response = await axiosInstance.put(`/${id}`, propertyBean);
    return response.data;
};

// Xóa tài sản
export const deleteProperty = async (id) => {
    await axiosInstance.delete(`/${id}`);
};
