const express = require("express");
const router = express.Router();

const {
  login,
  signup,
  logout,
  checkAuth,
  userDetail,
  getAllUsers,
  getUserById,
  updateProfileDetail,
} = require("../Controller/credentialsController");

const {
  sendOTP,
  verifyOTP,
  forgetPasswordSendOTP,
  forgetPasswordVerifyOTP,
  forgetPasswordResetPassword,
} = require("../Controller/mobile-twilioController");

const authenticateToken = require("../Middleware/tokenauth");
const upload = require("../Config/multer");

/* ===== AUTH ===== */
router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", authenticateToken, logout);
router.get("/checkAuth", authenticateToken, checkAuth);

/* ===== OTP ===== */
router.post("/verification/sendOTP", sendOTP);
router.post("/verification/verifyOTP", verifyOTP);

router.post("/forgetPassword/sendOTP", forgetPasswordSendOTP);
router.post("/forgetPassword/verifyOTP", forgetPasswordVerifyOTP);
router.post("/forgetPassword/resetPassword", forgetPasswordResetPassword);

/* ===== PROFILE ===== */
router.post(
  "/profileDetails",
  authenticateToken,
  upload.single("profileImage"),
  userDetail
);

router.put(
  "/profileDetails",
  authenticateToken,
  upload.single("profileImage"),
  updateProfileDetail
);

/* ===== USERS ===== */
router.get("/users", authenticateToken, getAllUsers);
router.get("/users/:id", authenticateToken, getUserById);

module.exports = router;
