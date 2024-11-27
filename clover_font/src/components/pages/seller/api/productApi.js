import axios from "axios";

const API_URL = "http://localhost:8080/api/sell/product";

// Tạo axios instance để sử dụng baseURL và cấu hình chung
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Thêm JWT vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
 
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API Services
const productService = {
  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    const response = await axiosInstance.get("");
    return response.data;
  },

  // Lấy sản phẩm theo người bán
  getProductsBySeller: async () => {
    const response = await axiosInstance.get("/getProductBySeller");
    return response.data;
  },

  // Thêm sản phẩm mới
  createProduct: async (productData) => {
   console.log(productData);
   
    try {
     

      for (let pair of productData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      const response = await axiosInstance.post("/create", productData, {
        headers: { "Content-Type": "multipart/form-data" },  // Đặt header Content-Type đúng
      });
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error; // Hoặc xử lý lỗi theo cách bạn muốn
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (productData) => {
    
    
  
    for (let pair of productData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  
    // Gửi yêu cầu PUT
    try {
      const response = await axiosInstance.put("/update", productData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      // In chi tiết lỗi để dễ dàng debug
      console.error("Error updating product:", error.response ? error.response.data : error);
      throw error;
    }
  },
  
  


  // Xóa sản phẩm
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete("/delete", { params: { id } });
    return response.data;
  },
};

export default productService;
