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
export const getOrders = async (page = 1, limit = 10, status) => {
  try {
    const params = { page, limit };
    if (status && status !== 'all') {
      params.status = status;
    }
    const response = await axiosInstance.get('/orders', {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axiosInstance.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrder = async (orderId, payload) => {
  try {
    const response = await axiosInstance.put(`/orders/${orderId}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const response = await axiosInstance.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};






