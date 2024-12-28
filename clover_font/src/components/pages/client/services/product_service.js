import axios from 'axios';
const API_URL = 'http://localhost:8080/api';
const API_HOME_URL = '/home';
const API_DETAILPRODUCT_URL = '/detailproduct';
const API_LIST_URL = '/listProduct';

const API_TYPEE_URL = '/listProduct/typeProduct';
const API_LISTSAVE_URL = '/listProduct/listProductSave';
const API_SALE_PRODUCT_URL = '/saleProduct';

// Tạo instance axios
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
export const getProductsClassTrue = async () => {
    try {
        const response = await axiosInstance.get(`${API_HOME_URL}/productClassTrue`).catch(function (error) {
            window.location = "/error";
        });;
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};
export const getProductsClassFalse = async () => {
    try {
        const response = await axiosInstance.get(`${API_HOME_URL}/productClassFalse`).catch(function (error) {
            window.location = "/error";
        });;
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};
export const getBestSellerProd = async () => {
    try {
        const response = await axiosInstance.get(`${API_HOME_URL}/prodBestSeller`).catch(function (error) {
            window.location = "/error";
        });;
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};

export const getDetailProductById = async (id) => {
    try {
        const response = await axiosInstance.get(`${API_DETAILPRODUCT_URL}/${id}`).catch(function (error) {
            window.location = "/error";
        });;
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};

export const getAllProducts = async (page, size) => {
    try {
        const response = await axiosInstance.get(`${API_LIST_URL}?page=${page}&size=${size}`).catch(function (error) {
            window.location = "/error";
        });;
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};

export const getProductByType = async () => {
    try {
        const response = await axiosInstance.get(API_TYPEE_URL).catch(function (error) {
            window.location = "/error";
        });;
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};

export const getProductSave = async () => {
    try {
        const response = await axiosInstance.get(API_LISTSAVE_URL).catch(function (error) {
            window.location = "/error";
        });;
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};

export const getSaleProduct = async () => {
    try {
        const response = await axiosInstance.get(API_SALE_PRODUCT_URL).catch(function (error) {
            window.location = "/error";
        });;
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
            window.location.href = '/error/403';
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi
    }

};
