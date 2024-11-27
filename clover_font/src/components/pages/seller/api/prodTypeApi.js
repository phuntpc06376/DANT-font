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
    const response = await axiosInstance.get('');
    return response.data;
};

export const createTypeProduct = async (typeProductData) => {
    const response = await axiosInstance.post('/creatTypeProduct', null, {
        params: typeProductData
    });
    return response.data;
};

export const updateTypeProduct = async (id, typeProductData) => {
    const response = await axiosInstance.put('/updateTypeProduct', null, {
        params: { ...typeProductData, id }
    });
    return response.data;
};

export const deleteTypeProduct = async (id) => {
    await axiosInstance.delete('/deleteTypeProduct', { params: { id } });
};
