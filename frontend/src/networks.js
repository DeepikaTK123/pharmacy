import axios from 'axios';

// Use HTTPS base URL
const BASE_URL = 'https://care4link.com/api';
console.log(BASE_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers['access-token'] = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    sessionStorage.clear();
    window.location.href = '/';
  }
  return Promise.reject(error);
});

export const login = (data) => {
  return axiosInstance.post('/users/login', data);
};

export const getDashboardCount = () => {
  return axiosInstance.get('/dashboard/getdashboardcount');
};

export const getRevenueChart = (period) => {
  return axiosInstance.post('/dashboard/getrevenuechart', { period });
};

export const getLowStockMedicines = () => {
  return axiosInstance.get('/dashboard/getlowstockmedicines');
};

// Pharmacy API
export const addMedicine = (data) => {
  return axiosInstance.post('/medicines/addmedicine', data);
};

export const getMedicines = () => {
  return axiosInstance.get('/medicines/getmedicines');
};

export const updateMedicine = (data) => {
  return axiosInstance.post('/medicines/edit', data);
};

export const deleteMedicine = (data) => {
  return axiosInstance.post('/medicines/delete', { id: data });
};

// Billing API
export const addBillingRecord = (data) => {
  return axiosInstance.post('/billing/add', data);
};

export const getBillingRecords = () => {
  return axiosInstance.get('/billing/get');
};

export const updateBillingRecord = (data) => {
  return axiosInstance.post('/billing/edit', data);
};

export const deleteBillingRecord = (id) => {
  return axiosInstance.post('/billing/delete', { id });
};

export const getPatientName = (phoneNumber) => {
  return axiosInstance.post('/billing/getpatientname', { phone_number: phoneNumber });
};

export const getHighBillingUsers = () => {
  return axiosInstance.get('/dashboard/gethighbillingusers');
};

export const addSupplier = (data) => {
  return axiosInstance.post('/suppliers/add', data);
};

export const getSuppliers = () => {
  return axiosInstance.get('/suppliers/get');
};

export const updateSupplier = (data) => {
  return axiosInstance.post('/suppliers/edit', data);
};

export const deleteSupplier = (id) => {
  return axiosInstance.post('/suppliers/delete', { id });
};

export const uploadInvoice = (data) => {
  return axiosInstance.post('/invoices/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
