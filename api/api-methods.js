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

// Get Customers API method
export const getCustomers = async (page = 1, limit = 1000) => {
  try {
    const response = await axiosInstance.get('/customers', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Transports API method
export const getTransports = async (page = 1, limit = 1000) => {
  try {
    const response = await axiosInstance.get('/transports', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Products API method
export const getProducts = async (page = 1, limit = 1000) => {
  try {
    const response = await axiosInstance.get('/products', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Raw Materials API method
export const getRawMaterials = async (page = 1, limit = 1000) => {
  try {
    const response = await axiosInstance.get('/raw-materials', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create Order API method
export const createOrder = async (payload) => {
  try {
    const response = await axiosInstance.post('/orders', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generate Upload URL API method
export const generateUploadUrl = async (fileName, fileType, folderName) => {
  try {
    const response = await axiosInstance.post('/users/generate-upload-url', {
      fileName,
      fileType,
      folderName,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create Product API method
export const createProduct = async (payload) => {
  try {
    const response = await axiosInstance.post('/products', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update Product API method
export const updateProduct = async (productId, payload) => {
  try {
    const response = await axiosInstance.put(`/products/${productId}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete Product API method
export const deleteProduct = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};






