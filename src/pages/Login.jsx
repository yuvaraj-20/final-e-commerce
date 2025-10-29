// src/pages/Login.jsx
import React, { useState } from "react";
import { login, me } from "../lib/apiClient";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; // <-- make sure this exists

const themes = {
  user: {
    gradient: "from-emerald-400 to-cyan-400",
    glowA: "bg-emerald-400/30",
    glowB: "bg-cyan-400/30",
    accent: "text-emerald-300",
    panel: "bg-white/5",
  },
  dealer: {
    gradient: "from-indigo-400 to-fuchsia-500",
    glowA: "bg-indigo-400/30",
    glowB: "bg-fuchsia-500/30",
    accent: "text-fuchsia-300",
    panel: "bg-white/5",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, markLoggedIn } = useAuth(); // from AuthContext

  const [role, setRole] = useState("user"); // UI role: "user" | "dealer"
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = themes[role];
  const canSubmit = Boolean(identifier.trim()) && password.length >= 6 && !loading;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      // Map UI role -> backend role
      const backendRole = role === "user" ? "customer" : "seller";

      // 1) Login (CSRF + cookies handled in apiClient)
      await login({ role: backendRole, identifier, password });

      // 2) Warm the session and store user in context + localStorage
      const u = await me();
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      markLoggedIn?.(true);

      toast.success("Signed in");

      // 3) Redirect to ?next=... if present, else home
      const params = new URLSearchParams(location.search);
      const next = params.get("next");
      navigate(next || "/home", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <motion.div
        className={`pointer-events-none absolute -top-32 -left-28 h-96 w-96 rounded-full blur-3xl ${t.glowA}`}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className={`pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl ${t.glowB}`}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.1 }}
      />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className={`w-full max-w-md rounded-3xl border border-white/10 ${t.panel} p-6 shadow-2xl backdrop-blur-xl`}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="mb-6 inline-flex items-center gap-3"
              initial={{ x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 font-bold text-slate-900">
                {role === "user" ? "U" : "D"}
              </div>
              <div className="text-lg font-semibold tracking-tight">
                {role === "user" ? "Welcome back" : "Partner sign in"}
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs ${
                  role === "user"
                    ? "bg-emerald-400/20 text-emerald-200"
                    : "bg-fuchsia-400/20 text-fuchsia-200"
                }`}
              >
                {role === "user" ? "Shopper" : "Dealer"}
              </span>
            </motion.div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              {["user", "dealer"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  disabled={loading}
                  className={`rounded-xl px-3 py-2 text-sm transition ${
                    role === r
                      ? `bg-gradient-to-r ${themes[r].gradient} text-slate-9 00`
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                  aria-pressed={role === r}
                >
                  {r === "user" ? "User" : "Dealer"}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300">Email or Phone</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or 9876543210"
                  disabled={loading}
                  className={`w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none placeholder:text-slate-400 focus:border-white/20 ${
                    loading ? "opacity-70" : ""
                  }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className={`w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 pr-24 outline-none placeholder:text-slate-400 focus:border-white/20 ${
                      loading ? "opacity-70" : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-200 hover:bg-white/20"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={{ scale: canSubmit ? 1.01 : 1 }}
                whileTap={{ scale: canSubmit ? 0.98 : 1 }}
                className={`group relative w-full overflow-hidden rounded-2xl px-4 py-3 font-medium transition ${
                  canSubmit
                    ? `bg-gradient-to-r ${t.gradient} text-slate-900 shadow-[0_8px_30px_rgba(16,185,129,0.25)]`
                    : "bg-white/10 text-slate-300 opacity-60"
                }`}
              >
                <span className="relative z-10">
                  {loading
                    ? "Signing in…"
                    : `Sign in as ${role === "dealer" ? "Dealer" : "User"}`}
                </span>
                <motion.span
                  initial={{ x: "-120%" }}
                  animate={{ x: canSubmit ? ["-120%", "120%"] : "-120%" }}
                  transition={{ duration: 1.2, repeat: canSubmit ? Infinity : 0, ease: "easeInOut" }}
                  className="absolute inset-y-0 -skew-x-12 bg-white/25"
                  style={{ width: "30%" }}
                />
              </motion.button>

              <div className="pt-2 text-center text-sm text-slate-300">
                New here?{" "}
                <Link to="/signup" className={`${t.accent} hover:underline`}>
                  Create an account
                </Link>
              </div>
            </form>
          </motion.div>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <motion.div
            className="relative mx-auto w-[85%] max-w-xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div
              className={`absolute -inset-6 -z-10 rounded-3xl blur-2xl ${
                role === "user"
                  ? "bg-gradient-to-br from-emerald-400/20 to-cyan-400/20"
                  : "bg-gradient-to-br from-fuchsia-400/20 to-indigo-400/20"
              }`}
            />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  {role === "user" ? "Your style, your store" : "Partner dashboard"}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    role === "user"
                      ? "bg-emerald-400/20 text-emerald-200"
                      : "bg-fuchsia-400/20 text-fuchsia-200"
                  }`}
                >
                  {role === "user" ? "Live" : "Dealer"}
                </span>
              </div>
              {role === "user" ? (
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <motion.div key={i} whileHover={{ y: -4 }} className="aspect-square rounded-2xl bg-white/10 ring-1 ring-white/10" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {["Today’s Orders", "Conversion Rate", "Top Category"].map((label, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.01 }} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm text-slate-300">{label}</div>
                      <div className="mt-1 text-2xl font-semibold">{i === 0 ? "132" : i === 1 ? "3.2%" : "Streetwear"}</div>
                    </motion.div>
                  ))}
                </div>
              )}
              <p className="mt-5 text-sm text-slate-300">
                {role === "user" ? "Curated drops and seasonal deals." : "Grow your brand with powerful tools."}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
