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
    const response = await axiosInstance.get('/getAllPromotionByShop');
    return response.data;
};

export const createPromotion = async (promotionData) => {
    const response = await axiosInstance.post('/create', null, {
        params: promotionData
    });
    return response.data;
};

export const updatePromotion = async (id, promotionData) => {
    const response = await axiosInstance.put(`/update`, null, {
        params: { ...promotionData, id }
    });
    return response.data;
};

export const deletePromotion = async (id) => {
    await axiosInstance.delete(`/delete`, { params: { id } });
};
