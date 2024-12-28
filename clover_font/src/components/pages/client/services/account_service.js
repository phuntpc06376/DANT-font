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
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      window.location.href = '/error/403';
    }
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }

};
//LẤY USER QUA USERNAME
// Hàm này sẽ lấy thông tin tài khoản người dùng từ API, sử dụng token từ header
export const getAccountByUsername = async (token) => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data; // Trả về dữ liệu người dùng
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      window.location.href = '/error/403';
    }
    throw error; // Throw lại lỗi nếu có
  }
};


//CHECK POINT 
export const postCheckPoint = async (point, username) => {
  try {
    const response = await axiosInstance.post(`${API_CHECKPOINT_URL}/${point}/${username}`).catch(function (error) {
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
//  LOGIN RETURN TOKEN
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_LOGIN_URL}/${username}/${password}`).catch(function (error) {
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
export const getAccountById = async (id) => {
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
//register
export const register = async (account) => {
  try {
    const response = await axios.post(API_REGISTER_URL, account).catch(function (error) {
      window.location = "/error";
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

//CHECK USERNAME
export const checkUsername = async (ussername) => {
  try {
    const response = await axios.post(`${API_CHECK_USERNAME_URL}/${ussername}`).catch(function (error) {
      window.location = "/error";
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

//CHECK EMAIL
export const checkEmail = async (Email) => {
  try {
    const response = await axios.post(`${API_CHECK_EMAIL_URL}/${Email}`).catch(function (error) {
      window.location = "/error";
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
//CHECK PHONE
export const checkPhone = async (phone) => {
  try {
    const response = await axios.post(`${API_CHECK_PHONE_URL}/${phone}`).catch(function (error) {
      window.location = "/error";
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
//UPINFOR

export const getInforUser = async (username) => {
  try {
    const response = await axiosInstance.get(`${API_UPINFOR_URL}/${username}`).catch(function (error) {
      window.location = "/error/403";
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      window.location.href = '/login';
    }
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }

};
//UPDATE ACCOUNT
export const updateAccount = async (id, account) => {
  try {
    const response = await axiosInstance.put(`${API_UPINFOR_UPDATE_URL}/${id}`, account).catch(function (error) {
      window.location = "/error";
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
// UPINFOR CHECK PHONE

export const checkPhoneInfor = async (username, phone) => {
  try {
    const response = await axiosInstance.get(`${API_UPINFOR_CHECKPHONE_URL}/${phone}/${username}`).catch(function (error) {
      window.location = "/error";
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
//UPINFOR CHECK EMAIL

export const checkEmailInfor = async (username, email) => {
  console.log(username + '' + email);
  try {
    const response = await axiosInstance.get(`${API_UPINFOR_EMAIL_URL}/${email}/${username}`).catch(function (error) {
      window.location = "/error";
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
//DELETE ACCOUNT
export const deleteAccount = async (id) => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`).catch(function (error) {
      window.location = "/error";
    });;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      window.location.href = '/error/403';
    }
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }

};
//GET ACCOUNT BY USERNAME

export const getAccountByUserName = async (username) => {
  try {
    const response = await axiosInstance.get(`${API_CHANGEPASS_GET_USER_URL}/${username}`).catch(function (error) {
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
//GET USER INFO
export const getUser = async (user) => {
  try {
    const response = await axiosInstance.get(`${API_INFOR_URL}/${user}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      window.location.href = '/error/403';
    }
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }

}

//CHANGE PASS

export const changePass = async (username, password) => {
  try {
    const response = await axiosInstance.put(`${API_CHANGEPASS_UPDATE_PASS_URL}/${username}/${password}`).catch(function (error) {
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



//CHECK PASS AND OLD PASS
export const checkPassAndOldPass = async (username, oldPass) => {
  try {
    const response = await axiosInstance.put(`${API_CHANGEPASS_CHECKPASS_AND_OLDPASS_URL}/${username}/${oldPass}`).catch(function (error) {
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
//CHECK USER FORGOT
export const checkUserForgot = async (username) => {
  try {
    const response = await axios.get(`${API_CHECK_USER_FORGOTPASSWORD}/${username}`).catch(function (error) {
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
//CHECK TOKEN FORGOT PASS

export const checkTokenForgot = async (token) => {
  try {
    const response = await axios.get(`${API_CHECK_TOKEN_FORGOT}/${token}`).catch(function (error) {
      window.location = "/error";
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      window.location.href = '/error/403';
    }
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }

}
//CHANGE PASSWORD AFTER CHECK USER FORGOT

export const changePasswordForgot = async (username, password) => {
  try {
    const response = await axios.put(`${API_CHANGE_PASSWORD_FORGOT}/${username}/${password}`).catch(function (error) {
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
//GET ROLE USER WITH TOKEN
export const getRole = async (token) => {
  try {
    const response = await axios.get(`${API_GET_ROLE_URL}/${token}`).catch(function (error) {
      window.location = "/error";
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      window.location.href = '/error/403';
    }
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }

}
// GET USER WITH TOKEN
export const getUserByToken = async (token) => {
  try {
    const response = await axios.get(`${API_GET_USER_URL}/${token}`).catch(function (error) {
      window.location = "/error";
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Chuyển hướng đến trang đăng nhập khi bị từ chối truy cập
      window.location.href = '/error/403';
    }
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }

}