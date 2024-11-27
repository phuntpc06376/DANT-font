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
    const response = await axiosInstance.get(`${API_HOME_URL}/productClassTrue`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
};
export const getProductsClassFalse = async () => {
    const response = await axiosInstance.get(`${API_HOME_URL}/productClassFalse`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
};
export const getBestSellerProd = async () => {
    const response = await axiosInstance.get(`${API_HOME_URL}/prodBestSeller`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
};

export const getDetailProductById = async (id) => {
    const response = await axiosInstance.get(`${API_DETAILPRODUCT_URL}/${id}`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
};

export const getAllProducts = async (page,size) => {
    const response = await axiosInstance.get(`${API_LIST_URL}?page=${page}&size=${size}`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
};

export const getProductByType = async () => {
    const response = await axiosInstance.get(API_TYPEE_URL).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
};

export const getProductSave = async () => {
    const response = await axiosInstance.get(API_LISTSAVE_URL).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
};

export const getSaleProduct = async () => {
    const response = await axiosInstance.get(API_SALE_PRODUCT_URL).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
};
