import axios from 'axios';

const API_URL = 'http://localhost:8080/api';
const API_ORDER_URL = '/order';
const API_CART_ORDER_URL = '/user/bill/getProductCartToPay';

const API_ADD_CART_TO_ORDER_URL = '/user/bill/create';
const API_UPDATE_BILL_GHN = '/user/bill';
const API_BILL_URL = '/billclient/showBillCli';

const API_SHOW_DETAILBILL_URL = '/billclient/showDetailBill';

const API_CANCEL_BILL_URL = '/billclient/cancel_bill';

const API_PAYMENT_URL = '/payment/vn-pay';
const API_SET_ORDER_PAID_URL = '/order/updateBillAsPaid';
export const getAllOders = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
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
    } else {

    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// LẤY LIST CART TỪ LOCAL STORE ĐỂ THÊM TẠO BILL
export const getOrderFromCart = async (ids) => {
  try {
    const response = await axiosInstance.get(`${API_CART_ORDER_URL}?ids=${encodeURIComponent(ids)}`).catch(function (error) {

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
//PAYMENT
export const payment = async (amount, billID) => {
  try {
    const response = await axiosInstance.get(`${API_PAYMENT_URL}?amount=${amount}&orderId=${billID}`).catch(function (error) {

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
//SET BILL AS PAID
export const setBillAsPaid = async (id) => {
  try {
    const response = await axiosInstance.put(`${API_SET_ORDER_PAID_URL}/${id}`).catch(function (error) {

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
// ADD CART TO BILL
export const addCartToBill = async (carts) => {
  try {
    const response = await axiosInstance.post(`${API_ADD_CART_TO_ORDER_URL}`, carts).catch(function (error) {
      console.log(error);
    });
    return response.data; // Đảm bảo trả về dữ liệu từ response
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      window.location.href = '/error/403';
    }
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }

};

//SHOW BILL
export const showBill = async (username) => {
  try {
    const response = await axiosInstance.get(`${API_BILL_URL}/${username}`).catch(function (error) {

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
//update bill order Id 

export const updateBillOrderId = async (formdata) => {
  try {
    for (let [key, value] of formdata.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await axiosInstance.put(`${API_UPDATE_BILL_GHN}/setOrderGhn`, formdata).catch(function (error) {
      window.location = "/";
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      window.location.href = '/error/403';
    }
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }

};
//SHOW DETAIL BILL
export const showDetailBill = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_SHOW_DETAILBILL_URL}/${id}`).catch(function (error) {

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

//CANCEL BILL
export const cancelBill = async (id) => {
  try {
    const response = await axiosInstance.put(`${API_CANCEL_BILL_URL}/${id}`).catch(function (error) {

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
export const getOderById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_ORDER_URL}/${id}`).catch(function (error) {

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

export const createOder = async (student) => {
  try {
    const response = await axiosInstance.post(API_ORDER_URL, student).catch(function (error) {

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

export const updateOder = async (id, student) => {
  try {
    const response = await axiosInstance.put(`${API_ORDER_URL}/${id}`, student).catch(function (error) {

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

export const deleteOder = async (id) => {
  try {
    await axiosInstance.delete(`${API_ORDER_URL}/${id}`).catch(function (error) {

    });
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      window.location.href = '/error/403';
    }
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }

};