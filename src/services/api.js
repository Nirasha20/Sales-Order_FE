import axios from 'axios';

const BASE = 'http://localhost:5130/api';

export const getClients = () => axios.get(`${BASE}/clients`);
export const getClientById = (id) => axios.get(`${BASE}/clients/${id}`);
export const getItems = () => axios.get(`${BASE}/items`);
export const getOrders = () => axios.get(`${BASE}/salesorders`);
export const getOrderById = (id) => axios.get(`${BASE}/salesorders/${id}`);
export const saveOrder = (data) => axios.post(`${BASE}/salesorders`, data);
export const updateOrder = (id, data) => axios.put(`${BASE}/salesorders/${id}`, data);