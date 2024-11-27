import axios from 'axios';

const API_URL = 'http://localhost:8080/api/roles';
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

export const getAllRoles = async () => {
    const response = await axiosInstance.get();
    return response.data;
};

export const getRoleById = async (id) => {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
};

export const createRole = async (accountBean) => {
    const response = await axiosInstance.post('', accountBean);
    return response.data;
};

export const updateRole = async (id, accountBean) => {
    const response = await axiosInstance.put(`/${id}`, accountBean);
    return response.data;
};

export const deleteRole = async (id) => {
    await axiosInstance.delete(`/${id}`);
};
