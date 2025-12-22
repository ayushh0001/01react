import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendOtpApi,
  verifyOtpApi,
} from "../api/otp.api";

export default function PhoneNumberVerification() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (phone.length !== 10) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await sendOtpApi({ mobile: phone });

      setOtpSent(true);
      setMessage("OTP sent successfully!");
    } catch (err) {
      setMessage(
        err?.response?.data?.error || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 4) {
      setMessage("Please enter a valid 4-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await verifyOtpApi({
        mobile: phone,
        otp,
      });

      setMessage("Phone number verified successfully!");

      setTimeout(() => {
        navigate("/create-account");
      }, 1000);
    } catch (err) {
      setMessage(
        err?.response?.data?.error || "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-amber-300">
        <h1 className="text-2xl font-bold text-center mb-6 text-amber-600">
          Verify Your Phone Number
        </h1>

        {message && (
          <div className="mb-4 text-center text-sm text-blue-700 bg-blue-100 border border-blue-400 rounded py-2">
            {message}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <input
              type="text"
              maxLength={10}
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-3 border rounded-lg"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter 4-digit OTP"
              className="w-full px-4 py-3 border rounded-lg"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
