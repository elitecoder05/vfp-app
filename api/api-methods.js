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






