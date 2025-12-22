import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.instance";

export default function GSTDetails() {
  const navigate = useNavigate();
  const [gst, setGst] = useState("");

  const submitGst = async () => {
    await api.post("/sellers/gst", { gst });
    navigate("/bank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow">
        <input
          className="border p-2 mb-4 w-full"
          placeholder="GST Number"
          value={gst}
          onChange={(e) => setGst(e.target.value)}
        />
        <button
          onClick={submitGst}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
