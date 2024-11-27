import axios from 'axios';

const API_URL = 'http://localhost:8080/api/accounts';
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

export const getAllAccounts = async () => {
    const response = await axiosInstance.get();
    return response.data;
};

export const getAccountById = async (id) => {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
};

export const createAccount = async (accountBean) => {
    const response = await axiosInstance.post('', accountBean);
    return response.data;
};

export const updateAccount = async (id, accountBean) => {
    const response = await axiosInstance.put(`/${id}`, accountBean);
    return response.data;
};

export const deleteAccount = async (id) => {
    await axiosInstance.delete(`/${id}`);
};
