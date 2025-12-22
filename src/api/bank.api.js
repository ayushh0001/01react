import api from "./axios.instance";
export const saveBankApi = (data) => api.post("/bank", data);
