// api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://zpin-ecommerce-backend-997x.onrender.com/api/v1",
  // withCredentials: true, // only if your backend uses cookies + CORS configured
});

export default API;
