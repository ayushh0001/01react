import api from "./axios.instance";
export const getOrdersApi = () => api.get("/orders");
