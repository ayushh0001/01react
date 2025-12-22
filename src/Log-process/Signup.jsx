import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api/auth.api";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      // ✅ REQUIRED PAYLOAD (schema ke according)
      await signupApi({
        email,
        password,
        name: email.split("@")[0],          // temp name
        userName: email.split("@")[0],      // temp username
        mobile: "9999999999",               // temp (OTP flow me replace hoga)
      });

      navigate("/phone"); // next step OTP

    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err?.response?.data?.message || "Signup failed, try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-3 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {loading ? "Creating..." : "Next"}
        </button>
      </form>
    </div>
  );
}
