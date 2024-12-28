import axios from "axios";

const API_URL = "http://localhost:8080/api/account"; // Base URL API của bạn

// Hàm gọi API lấy thông tin account dựa trên username
export const getAccountByUsername = async (username) => {
    try {
        const response = await axios.get(`${API_URL}/${username}`);
        return response.data; // Trả về dữ liệu tài khoản
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error("Không tìm thấy tài khoản:", username);
        } else {
            console.error("Lỗi khi gọi API:", error.message);
        }
        throw error; // Ném lỗi để component phía trên xử lý
    }
};
