import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.instance";

export default function BankDetails() {
  const navigate = useNavigate();
  const [account, setAccount] = useState("");

  const submitBank = async () => {
    await api.post("/sellers/bank", { account });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow">
        <input
          className="border p-2 mb-4 w-full"
          placeholder="Bank Account Number"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
        <button
          onClick={submitBank}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
