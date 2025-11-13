// src/Protected.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/**
 * Protected wrapper for routes
 * @param {Array<string>} allow - array of roles allowed (e.g., ["admin","user"])
 */
export default function Protected({ children, allow = [] }) {
  const { user, isLoggedIn, checkedOnce } = useAuth();
  const location = useLocation();

  if (!checkedOnce) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-pulse text-gray-500">Checking authentication…</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    // 🔹 Redirect to login, preserving original location
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (allow.length > 0) {
    const role = String(user?.role || "").toLowerCase();
    const normalizedAllow = allow.map((r) =>
      r.toLowerCase() === "user" ? "customer" : 
      r.toLowerCase() === "dealer" ? "seller" : 
      r.toLowerCase()
    );

    if (!normalizedAllow.includes(role)) {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="max-w-lg text-center bg-white border rounded-lg p-8 shadow">
            <h3 className="text-lg font-semibold mb-2">Access denied</h3>
            <p className="text-sm text-gray-600 mb-6">
              You do not have permission to view this page.
            </p>
            <a
              href="/"
              className="inline-block px-4 py-2 rounded bg-indigo-600 text-white"
            >
              Go home
            </a>
          </div>
        </div>
      );
    }
  }

  return children;
}
