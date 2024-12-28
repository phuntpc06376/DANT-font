import axios from 'axios';
const API_URL = 'http://localhost:8080/api';
const API_FRIEND_URL = '/friend';
const API_LIST_URL = '/friend/getFriendByUsername';
const API_ADD_FRIEND_URL = '/friend/create';
const API_ACCEPT = '/friend/acecptFriendd';
const API_DELETE_FRIEND_URL = '/friend/delete';
const API_GET_FRIEND_ACCECPT = '/friend/getFriendByUsernameToConfirm';
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

// LẤY HẾT BẠN BÈ
// export const getAllFriendsByUsername = async (username) => {
//     const response = await axiosInstance.get(`${API_LIST_URL}/${username}`).catch(function (error) {
//         console.log(error);
//       });;
//     return response.data;
// };
export const getAllFriendsByUsername = async (username) => {
    const response = await axiosInstance.get(`${API_LIST_URL}`, {
        header: { username } // Chuyển `username` dưới dạng query param
    }).catch(function (error) {
        console.log(error);
    });
    return response.data;
};
export const getAllFriendsByUsernameToConfirm = async (username) => {
    const response = await axiosInstance.get(`${API_GET_FRIEND_ACCECPT}`, {
        params: { username } // Chuyển `username` dưới dạng query param
    }).catch(function (error) {
        console.log(error);
    });
    return response.data;
};
//THÊM BẠN 
export const addToFriend = async (formData) => {
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
    const response = await axiosInstance.post(`${API_ADD_FRIEND_URL}`,formData).catch(function (error) {
        console.log(error);
        
      });
    return response.data;
};
//XÓA BẠN BÈ
export const deleteFriend = async (friendId) => {
    
    const response = await axiosInstance.delete(`${API_DELETE_FRIEND_URL}`+'?idAccount2='+`${friendId}`).catch(function (error) {
        console.log(error);
        
        // window.location = "/error";
      });
      console.log(response);
      
    return response.data;
};
//CHẤP NHẬN BẠN BÈ
export const acceptFriend = async (friendId) => {
    const response = await axiosInstance.put(`${API_ACCEPT}`+'?id='+`${friendId}`).catch(function (error) {
        // window.location = "/error";
      });;
    return response.data;
};
