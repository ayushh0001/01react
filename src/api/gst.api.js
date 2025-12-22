import api from "./axios.instance";
export const saveGstApi = (data) => api.post("/gst", data);
