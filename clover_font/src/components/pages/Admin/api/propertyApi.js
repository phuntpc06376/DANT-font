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

/// Lấy tất cả tài sản
export const getAllProperties = async () => {
    try {
        const response = await axiosInstance.get();
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }
    
};

// Lấy tài sản theo ID
export const getPropertyById = async (id) => {
    try {
        const response = await axiosInstance.get(`/${id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }
    
};

// Tạo mới tài sản
export const createProperty = async (propertyBean) => {
    try {
        const response = await axiosInstance.post('', propertyBean);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }
    
};

// Cập nhật tài sản
export const updateProperty = async (id, propertyBean) => {
    try {
        const response = await axiosInstance.put(`/${id}`, propertyBean);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }
    
};

// Xóa tài sản
export const deleteProperty = async (id) => {
    try {
        await axiosInstance.delete(`/${id}`);
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }
    
};