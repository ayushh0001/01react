import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/* Logo */
const ZipinLogo = ({ className = "h-8 w-auto" }) => (
  <div className={`flex items-center justify-center font-['Bungee',cursive] text-2xl font-bold text-amber-500 ${className}`}>
    ZPIN
  </div>
);

/* Alert */
const AlertBox = ({ message, type = "info", onClose }) => {
  if (!message) return null;

  const styles = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16">
      <div className={`${styles[type]} p-4 rounded-lg border shadow-lg max-w-sm w-full flex justify-between`}>
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="font-bold">&times;</button>
      </div>
    </div>
  );
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // ✅ REAL AUTH

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("info");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    if (!email || !password) {
      setAlertMessage("Email and Password are required");
      setAlertType("error");
      return;
    }

    try {
      setLoading(true);

      // ✅ REAL API LOGIN
      await login({
        email,
        password,
      });

      setAlertMessage("Login successful");
      setAlertType("success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);

    } catch (err) {
      setAlertMessage(
        err?.response?.data?.message || "Invalid credentials"
      );
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AlertBox message={alertMessage} type={alertType} onClose={() => setAlertMessage(null)} />

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-amber-300 flex overflow-hidden min-h-[600px]">
        {/* Left */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="flex justify-center mb-6">
            <ZipinLogo className="h-10 w-auto" />
          </div>

          <h1 className="text-3xl font-bold mb-8 text-center">Welcome Back</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Email"
              className="w-full p-3 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded-xl text-white font-semibold ${
                loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-6">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-amber-600 font-semibold"
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Right */}
        <div className="hidden md:flex md:w-1/2 bg-amber-500/10 items-center justify-center">
          <img
            src="https://placehold.co/500x500?text=Login"
            alt="Login"
            className="w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
