import axios from 'axios';

const API_URL = 'http://localhost:8080/api/suppliers';
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Thêm interceptor để tự động thêm JWT vào các yêu cầu
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Lấy tất cả nhà cung cấp
export const getAllSuppliers = async () => {
    const response = await axiosInstance.get();
    return response.data;
};

// // Lấy nhà cung cấp theo ID
// export const getSupplierById = async (id) => {
//     const response = await axiosInstance.get(`/${id}`);
//     return response.data;
// };

// // Tạo nhà cung cấp mới
// export const createSupplier = async (supplierData) => {
//     const response = await axiosInstance.post('', supplierData);
//     return response.data;
// };

// Duyệt nhà cung cấp
export const browseSupplier = async (id, supplierData) => {
    const response = await axiosInstance.put(`/${id}`, supplierData);
    return response.data;
};

// Xóa nhà cung cấp
export const deleteSupplier = async (id) => {
    await axiosInstance.delete(`/${id}`);
};
