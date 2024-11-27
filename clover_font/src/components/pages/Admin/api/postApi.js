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

export const getBrowsePosts = async () => {
    const response = await axiosInstance.get('/browse');
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

export const createPost = async (postBean) => {
    const response = await axiosInstance.post('', postBean);
    return response.data;
};

export const updatePost = async (id, postBean) => {
    const response = await axiosInstance.put(`/${id}`, postBean);
    return response.data;
};

export const browsePost = async (id) => {
    const response = await axiosInstance.put(`/browse/${id}`);
    return response.data;
};

export const denouncePost = async (id) => {
    const response = await axiosInstance.delete(`/denounce/${id}`);
    return response.data;
};

// export const deletePost = async (id) => {
//     const response = await axiosInstance.delete(`/${id}`);
//     return response.data;
// };
