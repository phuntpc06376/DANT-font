import axios from 'axios';

// Cấu hình API URL
const API_URL = 'http://localhost:8080/api/suppilder';

// Tạo một Axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Thêm interceptor để tự động thêm JWT vào tất cả các yêu cầu
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Thêm token vào header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Lấy tất cả các nhà cung cấp
export const getAllSuppliers = async () => {
    try {
        const response = await axiosInstance.get('');
        return response.data; // Trả về danh sách các nhà cung cấp
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        throw error; // Ném lỗi nếu có
    }
};

// Tạo nhà cung cấp mới
export const createSupplier = async (supplierData) => {
    try {
        const response = await axiosInstance.post('/create', null, {
            params: supplierData // Truyền dữ liệu qua params
        });
        return response.data; // Trả về thông tin nhà cung cấp vừa tạo
    } catch (error) {
        console.error('Error creating supplier:', error);
        throw error; // Ném lỗi nếu có
    }
};

// Cập nhật thông tin nhà cung cấp
export const updateSupplier = async (id, supplierData) => {
    try {
        const response = await axiosInstance.put('/update', null, {
            params: { ...supplierData, id } // Gửi id và các thông tin cần cập nhật qua params
        });
        return response.data; // Trả về thông tin nhà cung cấp đã cập nhật
    } catch (error) {
        console.error('Error updating supplier:', error);
        throw error; // Ném lỗi nếu có
    }
};

// Xóa nhà cung cấp
export const deleteSupplier = async (id) => {
    try {
        await axiosInstance.delete('/delete', { params: { id } }); // Truyền id qua params để xóa
    } catch (error) {
        console.error('Error deleting supplier:', error);
        throw error; // Ném lỗi nếu có
    }
};

// Lấy danh sách nhà cung cấp theo productId
export const getSuppliersByProduct = async (productId) => {
    try {
        // Gọi API lấy nhà cung cấp theo productId
        const response = await axiosInstance.get(`/suppliers/${productId}`);
        return response.data; // Trả về danh sách nhà cung cấp
    } catch (error) {
        console.error('Error fetching suppliers by productId:', error);
        throw error; // Ném lỗi nếu có
    }
};
