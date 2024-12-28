import axios from 'axios';

const API_URL = 'http://localhost:8080/api/typeproduct';
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

export const getAllTypeProducts = async () => {
    try {
        const response = await axiosInstance.get('');
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};

export const createTypeProduct = async (typeProductData) => {
    try {
        const response = await axiosInstance.post('/creatTypeProduct', null, {
            params: typeProductData
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};

export const updateTypeProduct = async (id, typeProductData) => {
    try {
        const response = await axiosInstance.put('/updateTypeProduct', null, {
            params: { ...typeProductData, id }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};

export const deleteTypeProduct = async (id) => {
    try {
        await axiosInstance.delete('/deleteTypeProduct', { params: { id } });
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};
