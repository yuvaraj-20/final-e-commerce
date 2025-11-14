// src/pages/OauthCallback.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ensureCsrf, me } from "../lib/apiClient";
import { useStore } from "../store/useStore";

export default function OauthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await ensureCsrf();
      const user = await me();
      useStore.setUser(user);
      const next = new URLSearchParams(location.search).get("next") || "/";
      navigate(next);
    })();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <p>Finishing sign-in with Google</p>
    </div>
  );
}
