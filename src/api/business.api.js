import api from "./axios.instance";
export const saveBusinessApi = (data) => api.post("/business", data);
