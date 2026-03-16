import axiosInstance from './axiosInstance';

const sanitizeValue = (value) => {
  if (!value || typeof value !== 'object') return value;

  const clone = Array.isArray(value) ? [...value] : { ...value };
  Object.keys(clone).forEach((key) => {
    if (typeof clone[key] === 'object' && clone[key] !== null) {
      clone[key] = sanitizeValue(clone[key]);
    }
    if (key.toLowerCase().includes('password')) {
      clone[key] = '***';
    }
  });

  return clone;
};

const logApiCall = ({ name, method, url, payload, params }) => {
  console.log('==================================================');
  console.log(`[API CALL] ${name}`);
  console.log(`Method: ${method}`);
  console.log(`Endpoint: ${url}`);
  if (params !== undefined) {
    console.log('Query Params:', sanitizeValue(params));
  }
  if (payload !== undefined) {
    console.log('Payload:', sanitizeValue(payload));
  }
  console.log('--------------------------------------------------');
};

const logApiSuccess = ({ name, status, data }) => {
  console.log(`[API SUCCESS] ${name}`);
  console.log(`Status: ${status}`);
  console.log('Response:', data);
  console.log('==================================================');
};

const logApiError = ({ name, error }) => {
  console.log(`[API ERROR] ${name}`);
  console.log('Message:', error?.message || 'Unknown error');
  if (error?.response) {
    console.log(`Status: ${error.response.status}`);
    console.log('Error Response:', error.response.data);
  }
  console.log('==================================================');
};

// Login API method
export const loginUser = async (phone, password) => {
  const endpoint = '/users/login';
  const payload = { phone, password };
  logApiCall({ name: 'loginUser', method: 'POST', url: endpoint, payload });
  try {
    const response = await axiosInstance.post(endpoint, payload);
    logApiSuccess({ name: 'loginUser', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'loginUser', error });
    throw error;
  }
};

// Get Orders API method
export const getOrders = async (page = 1, limit = 10, status) => {
  const endpoint = '/orders';
  try {
    const params = { page, limit };
    if (status && status !== 'all') {
      params.status = status;
    }
    logApiCall({ name: 'getOrders', method: 'GET', url: endpoint, params });
    const response = await axiosInstance.get(endpoint, { params });
    logApiSuccess({ name: 'getOrders', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'getOrders', error });
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  const endpoint = `/orders/${orderId}/status`;
  const payload = { status };
  logApiCall({ name: 'updateOrderStatus', method: 'PATCH', url: endpoint, payload });
  try {
    const response = await axiosInstance.patch(endpoint, payload);
    logApiSuccess({ name: 'updateOrderStatus', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'updateOrderStatus', error });
    throw error;
  }
};

export const updateOrder = async (orderId, payload) => {
  const endpoint = `/orders/${orderId}`;
  logApiCall({ name: 'updateOrder', method: 'PUT', url: endpoint, payload });
  try {
    const response = await axiosInstance.put(endpoint, payload);
    logApiSuccess({ name: 'updateOrder', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'updateOrder', error });
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  const endpoint = `/orders/${orderId}`;
  logApiCall({ name: 'deleteOrder', method: 'DELETE', url: endpoint });
  try {
    const response = await axiosInstance.delete(endpoint);
    logApiSuccess({ name: 'deleteOrder', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'deleteOrder', error });
    throw error;
  }
};

// Get Customers API method
export const getCustomers = async (page = 1, limit = 1000) => {
  const endpoint = '/customers';
  const params = { page, limit };
  logApiCall({ name: 'getCustomers', method: 'GET', url: endpoint, params });
  try {
    const response = await axiosInstance.get(endpoint, { params });
    logApiSuccess({ name: 'getCustomers', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'getCustomers', error });
    throw error;
  }
};

// Get Transports API method
export const getTransports = async (page = 1, limit = 10) => {
  const endpoint = '/transports';
  const params = { page, limit };
  logApiCall({ name: 'getTransports', method: 'GET', url: endpoint, params });
  try {
    const response = await axiosInstance.get(endpoint, { params });
    logApiSuccess({ name: 'getTransports', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'getTransports', error });
    throw error;
  }
};

// Create Transport API method
export const createTransport = async (payload) => {
  const endpoint = '/transports';
  logApiCall({ name: 'createTransport', method: 'POST', url: endpoint, payload });
  try {
    const response = await axiosInstance.post(endpoint, payload);
    logApiSuccess({ name: 'createTransport', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'createTransport', error });
    throw error;
  }
};

// Update Transport API method
export const updateTransport = async (transportId, payload) => {
  const endpoint = `/transports/${transportId}`;
  logApiCall({ name: 'updateTransport', method: 'PUT', url: endpoint, payload });
  try {
    const response = await axiosInstance.put(endpoint, payload);
    logApiSuccess({ name: 'updateTransport', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'updateTransport', error });
    throw error;
  }
};

// Delete Transport API method
export const deleteTransport = async (transportId) => {
  const endpoint = `/transports/${transportId}`;
  logApiCall({ name: 'deleteTransport', method: 'DELETE', url: endpoint });
  try {
    const response = await axiosInstance.delete(endpoint);
    logApiSuccess({ name: 'deleteTransport', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'deleteTransport', error });
    throw error;
  }
};

// Get Products API method
export const getProducts = async (page = 1, limit = 1000) => {
  const endpoint = '/products';
  const params = { page, limit };
  logApiCall({ name: 'getProducts', method: 'GET', url: endpoint, params });
  try {
    const response = await axiosInstance.get(endpoint, { params });
    logApiSuccess({ name: 'getProducts', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'getProducts', error });
    throw error;
  }
};

// Get Raw Materials API method
export const getRawMaterials = async (page = 1, limit = 10) => {
  const endpoint = '/raw-materials';
  const params = { page, limit };
  logApiCall({ name: 'getRawMaterials', method: 'GET', url: endpoint, params });
  try {
    const response = await axiosInstance.get(endpoint, { params });
    logApiSuccess({ name: 'getRawMaterials', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'getRawMaterials', error });
    throw error;
  }
};

// Create Raw Material API method
export const createRawMaterial = async (payload) => {
  const endpoint = '/raw-materials';
  logApiCall({ name: 'createRawMaterial', method: 'POST', url: endpoint, payload });
  try {
    const response = await axiosInstance.post(endpoint, payload);
    logApiSuccess({ name: 'createRawMaterial', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'createRawMaterial', error });
    throw error;
  }
};

// Update Raw Material API method
export const updateRawMaterial = async (rawMaterialId, payload) => {
  const endpoint = `/raw-materials/${rawMaterialId}`;
  logApiCall({ name: 'updateRawMaterial', method: 'PUT', url: endpoint, payload });
  try {
    const response = await axiosInstance.put(endpoint, payload);
    logApiSuccess({ name: 'updateRawMaterial', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'updateRawMaterial', error });
    throw error;
  }
};

// Delete Raw Material API method
export const deleteRawMaterial = async (rawMaterialId) => {
  const endpoint = `/raw-materials/${rawMaterialId}`;
  logApiCall({ name: 'deleteRawMaterial', method: 'DELETE', url: endpoint });
  try {
    const response = await axiosInstance.delete(endpoint);
    logApiSuccess({ name: 'deleteRawMaterial', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'deleteRawMaterial', error });
    throw error;
  }
};

// Create Order API method
export const createOrder = async (payload) => {
  const endpoint = '/orders';
  logApiCall({ name: 'createOrder', method: 'POST', url: endpoint, payload });
  try {
    const response = await axiosInstance.post(endpoint, payload);
    logApiSuccess({ name: 'createOrder', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'createOrder', error });
    throw error;
  }
};

// Generate Upload URL API method
export const generateUploadUrl = async (fileName, fileType, folderName) => {
  const endpoint = '/users/generate-upload-url';
  const payload = {
    fileName,
    fileType,
    folderName,
  };
  logApiCall({ name: 'generateUploadUrl', method: 'POST', url: endpoint, payload });
  try {
    const response = await axiosInstance.post(endpoint, payload);
    logApiSuccess({ name: 'generateUploadUrl', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'generateUploadUrl', error });
    throw error;
  }
};

// Create Product API method
export const createProduct = async (payload) => {
  const endpoint = '/products';
  logApiCall({ name: 'createProduct', method: 'POST', url: endpoint, payload });
  try {
    const response = await axiosInstance.post(endpoint, payload);
    logApiSuccess({ name: 'createProduct', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'createProduct', error });
    throw error;
  }
};

// Update Product API method
export const updateProduct = async (productId, payload) => {
  const endpoint = `/products/${productId}`;
  logApiCall({ name: 'updateProduct', method: 'PUT', url: endpoint, payload });
  try {
    const response = await axiosInstance.put(endpoint, payload);
    logApiSuccess({ name: 'updateProduct', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'updateProduct', error });
    throw error;
  }
};

// Delete Product API method
export const deleteProduct = async (productId) => {
  const endpoint = `/products/${productId}`;
  logApiCall({ name: 'deleteProduct', method: 'DELETE', url: endpoint });
  try {
    const response = await axiosInstance.delete(endpoint);
    logApiSuccess({ name: 'deleteProduct', status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApiError({ name: 'deleteProduct', error });
    throw error;
  }
};






