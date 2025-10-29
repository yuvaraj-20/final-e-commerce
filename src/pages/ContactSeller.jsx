// src/pages/ContactSeller.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ContactSeller() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-semibold mb-4">Contact Seller</h1>

        <p className="text-gray-700 mb-4">You can message the seller or open a chat. Use this page to provide additional contact options or a short form.</p>

        <div className="space-y-3">
          <button onClick={() => navigate('/chat')} className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white">Open Chat</button>
          <a href="mailto:seller@example.com" className="block text-center text-sm text-indigo-600 underline">Email the seller</a>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <button onClick={() => navigate(-1)} className="underline">Back</button>
        </div>
      </div>
    </div>
  );
}
