import axios from 'axios';

const API_URL = 'http://localhost:8080/api/seller/promotion';
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

export const getAllPromotionsByShop = async () => {
    try {
        const response = await axiosInstance.get('/getAllPromotionByShop');
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};

export const createPromotion = async (promotionData) => {
    try {
        const response = await axiosInstance.post('/create', null, {
            params: promotionData
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

export const updatePromotion = async (id, promotionData) => {
    try {
        const response = await axiosInstance.put(`/update`, null, {
            params: { ...promotionData, id }
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

export const deletePromotion = async (id) => {
    try {
        await axiosInstance.delete(`/delete`, { params: { id } });
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};
