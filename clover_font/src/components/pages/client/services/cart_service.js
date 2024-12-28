import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const API_CART_URL = '/cart';
const API_DETAIALPRODUCT_ADDTOCART_URL = '/detailproduct/addToCart';

const API_INCREMENT_QUANTITY_URL = '/cart/plus-quantity';

const API_DESCREMENT_QUANTITY_URL = '/cart/subtraction-quantity';

const API_DELETE_CART_URL = '/cart/delete-cart';

const API_PAYMENT_URL = '/order/payment';
// Tạo instance axios
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Thêm interceptor để tự động thêm JWT vào các yêu cầu
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log(token);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            window.location = "/error";
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// LẤY HẾT GIỎ HÀNG
export const getAllCartsByUsername = async (username) => {
    try {
        const response = await axiosInstance.get(`${API_CART_URL}/${username}`).catch(function (error) {
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

//THÊM GIỞ HÀNG 
export const addToCart = async (quantity, productId, username) => {
    try {
        const response = await axiosInstance.post(`${API_DETAIALPRODUCT_ADDTOCART_URL}/${quantity}/${productId}/${username}`).catch(function (error) {
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
//TĂNG SỐ LƯỢNG SẢN PHẨM 
export const incrementQuantity = async (cartId) => {
    try {
        const response = await axiosInstance.put(`${API_DESCREMENT_QUANTITY_URL}/${cartId}`).catch(function (error) {
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
//GIẢM SỐ LƯỢNG SẢN PHẨM
export const decrementQuantity = async (cartId) => {
    try {
        const response = await axiosInstance.put(`${API_INCREMENT_QUANTITY_URL}/${cartId}`).catch(function (error) {
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

//XÓA SẢN PHẨM
export const deleteCart = async (cartId) => {
    try {
        const response = await axiosInstance.delete(`${API_DELETE_CART_URL}/${cartId}`).catch(function (error) {
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
//LẤY GIỎ HÀNG THEO ID
export const getCartById = async (id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/${id}`).catch(function (error) {
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
//THANH TOÁN
export const payment = async (ids) => {
    try {
        const response = await axiosInstance.post(`${API_PAYMENT_URL}`, ids).catch(function (error) {
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

}
//TẠO GIỎ HÀNG
export const createCart = async (student) => {
    try {
        const response = await axiosInstance.post(API_URL, student).catch(function (error) {
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

export const updateCart = async (id, student) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/${id}`, student).catch(function (error) {
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

