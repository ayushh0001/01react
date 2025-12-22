import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.instance";

export default function Details() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const submitDetails = async () => {
    await api.post("/sellers/details", { name });
    navigate("/gst-details");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow">
        <input
          className="border p-2 mb-4 w-full"
          placeholder="Business Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={submitDetails}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
