import axios from 'axios';

const API_MAIN_URL = 'http://localhost:8080/api';

const API_URL = '/account';
const API_CHECK_TOKEN_FORGOT = 'http://localhost:8080/api/forgotPassword';
const API_CHANGE_PASSWORD_FORGOT = 'http://localhost:8080/api/forgotPassword';
const API_ORDER_URL = 'http://localhost:8080/api/account';
const API_CHECK_USER_FORGOTPASSWORD = 'http://localhost:8080/api/forgotPassword';
const API_INFOR_URL = '/inforuser/infoClient';
const API_CHECKPOINT_URL = '/order/check-point';
const API_LOGIN_URL = 'http://localhost:8080/api/auth/login';
const API_REGISTER_URL = 'http://localhost:8080/api/auth/registerInfor';
const API_CHECK_USERNAME_URL = 'http://localhost:8080/api/auth/registerInfor/chekUsername';
const API_CHECK_PHONE_URL = 'http://localhost:8080/api/auth/registerInfor/chekPhone';
const API_CHECK_EMAIL_URL = 'http://localhost:8080/api/auth/registerInfor/chekEmail';
const API_UPINFOR_URL = '/upInfor';
const API_UPINFOR_UPDATE_URL = '/upInfor/update';
const API_UPINFOR_CHECKPHONE_URL = '/upInfor/checkPhone';
const API_UPINFOR_EMAIL_URL = '/upInfor/checkEmail';
const API_CHANGEPASS_GET_USER_URL = '/auth/changePass/getUser';
const API_CHANGEPASS_UPDATE_PASS_URL = '/auth/changePass/changePass';
const API_CHANGEPASS_CHECKPASS_AND_OLDPASS_URL = '/auth/changePass/checkPassAndOldPass';
const API_GET_ROLE_URL = 'http://localhost:8080/api/auth/login/getRole';
const API_GET_USER_URL = 'http://localhost:8080/api/auth/login/getUser';

// Tạo instance axios
const axiosInstance = axios.create({
    baseURL: API_MAIN_URL,
});

// Thêm interceptor để tự động thêm JWT vào các yêu cầu
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
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

export const getAllAccounts = async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
};
//LẤY USER QUA USERNAME
// Hàm này sẽ lấy thông tin tài khoản người dùng từ API, sử dụng token từ header
export const getAccountByUsername = async ( token) => {
    try {
        const response = await axiosInstance.get(API_URL);
        return response.data; // Trả về dữ liệu người dùng
    } catch (error) {
        console.error("Error fetching account data:", error);
        throw error; // Throw lại lỗi nếu có
    }
};


//CHECK POINT 
export const postCheckPoint = async (point, username) => {
    const response = await axiosInstance.post(`${API_CHECKPOINT_URL}/${point}/${username}`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
};
//  LOGIN RETURN TOKEN
export const login = async (username, password) => {
    const response = await axios.post(`${API_LOGIN_URL}/${username}/${password}`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
}
export const getAccountById = async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
};
//register
export const register = async (account) => {
    const response = await axios.post(API_REGISTER_URL, account).catch(function (error) {
        window.location = "/error";
      });
    return response.data;
};

//CHECK USERNAME
export const checkUsername = async (ussername) => {
    const response = await axios.post(`${API_CHECK_USERNAME_URL}/${ussername}`).catch(function (error) {
        window.location = "/error";
      });
    return response.data;
};

//CHECK EMAIL
export const checkEmail = async (Email) => {
    const response = await axios.post(`${API_CHECK_EMAIL_URL}/${Email}`).catch(function (error) {
        window.location = "/error";
      });
    return response.data;
};
//CHECK PHONE
export const checkPhone = async (phone) => {
    const response = await axios.post(`${API_CHECK_PHONE_URL}/${phone}`).catch(function (error) {
        window.location = "/error";
      });
    return response.data;
};
//UPINFOR

export const getInforUser = async (username) => {
    const response = await axiosInstance.get(`${API_UPINFOR_URL}/${username}`).catch(function (error) {
        window.location = "/error";
      });
    return response.data;
};
//UPDATE ACCOUNT
export const updateAccount = async (id, account) => {
    const response = await axiosInstance.put(`${API_UPINFOR_UPDATE_URL}/${id}`, account).catch(function (error) {
        window.location = "/error";
      });
    return response.data;
};
// UPINFOR CHECK PHONE

export const checkPhoneInfor = async (username, phone) => {
    const response = await axiosInstance.get(`${API_UPINFOR_CHECKPHONE_URL}/${phone}/${username}`).catch(function (error) {
        window.location = "/error";
      });
    return response.data;
};
//UPINFOR CHECK EMAIL

export const checkEmailInfor = async (username, email) => {
    console.log(username + '' + email);
    const response = await axiosInstance.get(`${API_UPINFOR_EMAIL_URL}/${email}/${username}`).catch(function (error) {
        window.location = "/error";
      });
    return response.data;
};
//DELETE ACCOUNT
export const deleteAccount = async (id) => {
    await axiosInstance.delete(`${API_URL}/${id}`).catch(function (error) {
        window.location = "/error";
      });;
};
//GET ACCOUNT BY USERNAME

export const getAccountByUserName = async (username) => {
    const response = await axiosInstance.get(`${API_CHANGEPASS_GET_USER_URL}/${username}`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
}
//GET USER INFO
export const getUser = async (user) => {
    const response = await axiosInstance.get(`${API_INFOR_URL}/${user}`);
    return response.data;
}

//CHANGE PASS

export const changePass = async (username, password) => {
    const response = await axiosInstance.put(`${API_CHANGEPASS_UPDATE_PASS_URL}/${username}/${password}`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
}



//CHECK PASS AND OLD PASS
export const checkPassAndOldPass = async (username, oldPass) => {
    const response = await axiosInstance.put(`${API_CHANGEPASS_CHECKPASS_AND_OLDPASS_URL}/${username}/${oldPass}`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
}
//CHECK USER FORGOT
export const checkUserForgot = async (username) => {
    const response = await axios.get(`${API_CHECK_USER_FORGOTPASSWORD}/${username}`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
}
//CHECK TOKEN FORGOT PASS

export const checkTokenForgot = async ( token) => {
    const response = await axios.get(`${API_CHECK_TOKEN_FORGOT}/${token}`).catch(function (error) {
        window.location = "/error";
      });
    return response.data;
}
//CHANGE PASSWORD AFTER CHECK USER FORGOT

export const changePasswordForgot = async (username, password) => {
    const response = await axios.put(`${API_CHANGE_PASSWORD_FORGOT}/${username}/${password}`).catch(function (error) {
        window.location = "/error";
      });;
    return response.data;
}
//GET ROLE USER WITH TOKEN
export const getRole = async (token) => {
  const response = await axios.get(`${API_GET_ROLE_URL}/${token}`).catch(function (error) {
    window.location = "/error";
  });
  return response.data;
}
// GET USER WITH TOKEN
export const getUserByToken = async (token) => {
  const response = await axios.get(`${API_GET_USER_URL}/${token}`).catch(function (error) {
    window.location = "/error";
  });
  return response.data;
}