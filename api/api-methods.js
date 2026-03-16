import axiosInstance from './axiosInstance';

// Login API method
export const loginUser = async (phone, password) => {
  try {
    const response = await axiosInstance.post('/users/login', {
      phone,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Orders API method
export const getOrders = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get('/orders', {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};






