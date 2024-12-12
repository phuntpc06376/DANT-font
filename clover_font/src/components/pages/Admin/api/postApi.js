import axios from 'axios';

const API_URL = 'http://localhost:8080/api/posts';
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

export const getAllPosts = async () => {
    const response = await axiosInstance.get();
    return response.data;
};

export const getDenouncePosts = async () => {
    const response = await axiosInstance.get('/denounce');
    return response.data;
};

export const getPostById = async (id) => {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
};

export const denouncePost = async (id) => {
    try {
        const response = await axiosInstance.put(`/denounce/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error when denouncing post:", error);
        throw new Error(error.response ? error.response.data : "Không có phản hồi từ server");
    }
};

export const countDenounce = async (id) => {
    const response = await axiosInstance.get(`/count-denounce/${id}`);
    return response.data;
};


