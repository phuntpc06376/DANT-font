import axios from "axios";

const API_URL = "http://localhost:8080/api/shop"; // Thay bằng URL của bạn


export const getShopByAccount = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/getShopByAcount`, {
            headers: {
                Authorization: `Bearer ${token}`, // Gửi token trong header
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching shop data:", error);
        throw error;
    }
};
