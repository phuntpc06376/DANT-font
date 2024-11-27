import axios from 'axios';

const API_URL = 'http://localhost:8080/api/propertiesValues';
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
        }

        console.error(`Lỗi API (${status}): ${message}`);
        return Promise.reject(error);
    }
);

// Lấy tất cả PropertiesValue
export const getAllPropertiesValues = async () => {
    const response = await axiosInstance.get();
    return response.data;
};

// Lấy PropertiesValue theo ID
export const getPropertyValueById = async (id) => {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
};

// Tạo mới PropertiesValue
export const createPropertyValue = async (propertyValueBean) => {
    const response = await axiosInstance.post('', propertyValueBean);
    return response.data;
};

// Cập nhật PropertiesValue
export const updatePropertyValue = async (id, propertyValueBean) => {
    const response = await axiosInstance.put(`/${id}`, propertyValueBean);
    return response.data;
};

// Xóa PropertiesValue
export const deletePropertyValue = async (id) => {
    await axiosInstance.delete(`/${id}`);
};
