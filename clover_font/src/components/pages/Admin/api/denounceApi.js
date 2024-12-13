import axios from 'axios';

const API_URL = 'http://localhost:8080/api';
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

export const getAllDenounceByPostId = async (id) => {
    const response = await axiosInstance.get(`/denounce/${id}`);
    return response.data;
};



