import api from "./axios.instance";

export const sendOtpApi = (data) => {
  return api.post("/auth/verification/sendOTP", data);
};

export const verifyOtpApi = (data) => {
  return api.post("/auth/verification/verifyOTP", data);
};

export const forgotPasswordSendOtpApi = (data) => {
  return api.post("/auth/forgetPassword/sendOTP", data);
};

export const forgotPasswordVerifyOtpApi = (data) => {
  return api.post("/auth/forgetPassword/verifyOTP", data);
};

export const resetPasswordApi = (data) => {
  return api.post("/auth/forgetPassword/resetPassword", data);
};
