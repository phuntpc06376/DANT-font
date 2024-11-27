import axios from 'axios';

const API_URL = 'https://dev-online-gateway.ghn.vn';

export const createOrder = async (shopID, orderDetail) => {
    try {
      console.log("Sending Order:", orderDetail);
      const response = await axios.post(
        `${API_URL}/shiip/public-api/v2/shipping-order/create`,
        orderDetail,
        {
          headers: {
            shopid: shopID,
            token: 'f2bc89d4-90d2-11ef-8e53-0a00184fe694',
          },
        }
      );
      console.log("GHN Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi từ API GHN:", error.response?.data || error.message);
      throw error;
    }
  };
   
export const getProvince = async () => {
    const response = await axios.get(`${API_URL}/shiip/public-api/master-data/province`, {headers: { 'token': 'f2bc89d4-90d2-11ef-8e53-0a00184fe694'}});
    return response.data;
}
export const getDistrict = async (province_id) => {
    const response = await axios.get(`${API_URL}/shiip/public-api/master-data/district?province_id=${province_id}`, {headers: { 'token': 'f2bc89d4-90d2-11ef-8e53-0a00184fe694'}});
    return response.data;
}
export const getWard = async (province_id) => {
    const response = await axios.get(`${API_URL}/shiip/public-api/master-data/ward?district_id=${province_id}`, {headers: { 'token': 'f2bc89d4-90d2-11ef-8e53-0a00184fe694'}});
    return response.data;
}