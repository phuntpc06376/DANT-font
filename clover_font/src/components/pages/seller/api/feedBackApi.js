import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/user/evaluateFeedback';

// Lấy danh sách feedback
export const getEvaluateFeedback = async (id) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: { id },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback list:', error);
    throw error;
  }
};

// Tạo mới feedback
export const createEvaluateFeedback = async (params, imageFile) => {
  const formData = new FormData();
  Object.keys(params).forEach(key => {
    formData.append(key, params[key]);
  });
  formData.append('image', imageFile);

  try {
    const response = await axios.post(`${BASE_URL}/create`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
};

// Cập nhật feedback
export const updateEvaluateFeedback = async (params, imageFile) => {
  const formData = new FormData();
  Object.keys(params).forEach(key => {
    formData.append(key, params[key]);
  });
  formData.append('image', imageFile);

  try {
    const response = await axios.put(`${BASE_URL}/update`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

// Xóa feedback
export const deleteEvaluateFeedback = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete`, {
      params: { id },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};
