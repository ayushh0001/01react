import React from "react";
import { useNavigate } from "react-router-dom";

export default function CreateAccount() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Account Created</h2>
        <button
          onClick={() => navigate("/details")}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
