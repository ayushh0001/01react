// src/api/auth.api.js
import api from "./axios.instance";

/**
 * SIGNUP
 */
export const signupApi = (data) => {
  return api.post("/auth/signup", data);
};

/**
 * LOGIN
 */
export const loginApi = (data) => {
  return api.post("/auth/login", data);
};

/**
 * LOGOUT
 */
export const logoutApi = () => {
  return api.post("/auth/logout");
};
