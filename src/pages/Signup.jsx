import React, { useState } from "react";
import { signup } from "../lib/apiClient";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const themes = {
  user: {
    bgA: "from-emerald-400/25",
    bgB: "to-cyan-400/25",
    glowA: "bg-emerald-500/30",
    glowB: "bg-cyan-500/25",
    ring: "ring-emerald-300/40",
    chip: "bg-emerald-400/20 text-emerald-200",
    button: "from-emerald-400 to-cyan-400 text-slate-900",
    text: "text-emerald-300",
    label: "text-slate-300",
    panel: "bg-white/5",
  },
  dealer: {
    bgA: "from-fuchsia-400/20",
    bgB: "to-indigo-400/20",
    glowA: "bg-fuchsia-500/25",
    glowB: "bg-indigo-500/25",
    ring: "ring-fuchsia-300/40",
    chip: "bg-fuchsia-400/20 text-fuchsia-200",
    button: "from-fuchsia-400 to-indigo-400 text-slate-900",
    text: "text-fuchsia-300",
    label: "text-slate-300",
    panel: "bg-white/5",
  },
};

export default function Signup() {
  const [role, setRole] = useState("user");
  const t = themes[role];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneValid = /^\d{10}$/.test(form.phone || "");
  const passValid = form.password.length >= 8;
  const match = form.confirm.length > 0 && form.password === form.confirm;
  const canSubmit =
    Boolean(form.name) && emailValid && phoneValid && passValid && match && !loading;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      // 🔹 Map frontend role to backend role
      const backendRole = role === "user" ? "customer" : "seller";

      await signup({
        role: backendRole,
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      window.location.href = "/login";
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <motion.div
        className={`pointer-events-none absolute -top-28 -left-28 h-96 w-96 rounded-full blur-3xl ${t.glowA}`}
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
      <motion.div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(255,255,255,0.06)_0%,rgba(2,6,23,0)_70%)]`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Form side */}
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
                {role === "user" ? "E" : "D"}
              </div>
              <div className="text-lg font-semibold tracking-tight">
                {role === "user" ? "Ecom Studio" : "Ecom Dealer"}
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs ${t.chip}`}>
                {role === "user" ? "Shopper" : "Partner"}
              </span>
            </motion.div>

            <div className="mb-6">
              <h1 className="text-2xl font-semibold leading-tight">
                Create your {role === "user" ? "account" : "dealer account"}
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                {role === "user"
                  ? "Join the drops, deals, and exclusives."
                  : "Partner with us and start selling."}
              </p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              {["user", "dealer"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-xl px-3 py-2 text-sm transition ${
                    role === r
                      ? `bg-white/10 ${t.text} ring-1 ${t.ring}`
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                  aria-pressed={role === r}
                >
                  {r === "user" ? "User" : "Dealer"}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <Field label="Full name" labelClass={t.label}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Alex Carter"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none transition placeholder:text-slate-400 focus:border-white/20"
                  required
                />
              </Field>

              <Field
                label="Email"
                labelClass={t.label}
                hint={!emailValid && form.email ? "Invalid email" : undefined}
              >
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border px-3 py-2.5 outline-none transition placeholder:text-slate-400 ${
                    !emailValid && form.email
                      ? "border-red-400/40 bg-red-400/10 focus:border-red-400/60"
                      : "border-white/10 bg-white/5 focus:border-white/20"
                  }`}
                  required
                />
              </Field>

              <Field
                label="Phone"
                labelClass={t.label}
                hint={!phoneValid && form.phone ? "10-digit number" : undefined}
              >
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="9876543210"
                  className={`w-full rounded-xl border px-3 py-2.5 outline-none transition placeholder:text-slate-400 ${
                    !phoneValid && form.phone
                      ? "border-red-400/40 bg-red-400/10 focus:border-red-400/60"
                      : "border-white/10 bg-white/5 focus:border-white/20"
                  }`}
                  required
                  maxLength={10}
                />
              </Field>

              <Field
                label="Password"
                labelClass={t.label}
                hint={!passValid && form.password ? "Min 8 characters" : undefined}
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Create a strong password"
                    className={`w-full rounded-xl border px-3 py-2.5 pr-24 outline-none transition placeholder:text-slate-400 ${
                      !passValid && form.password
                        ? "border-red-400/40 bg-red-400/10 focus:border-red-400/60"
                        : "border-white/10 bg-white/5 focus:border-white/20"
                  }`}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-200 hover:bg-white/20"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </Field>

              <Field
                label="Confirm Password"
                labelClass={t.label}
                hint={form.confirm && !match ? "Passwords do not match" : undefined}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                  placeholder="Repeat password"
                  className={`w-full rounded-xl border px-3 py-2.5 outline-none transition placeholder:text-slate-400 ${
                    form.confirm && !match
                      ? "border-red-400/40 bg-red-400/10 focus:border-red-400/60"
                      : "border-white/10 bg-white/5 focus:border-white/20"
                  }`}
                  required
                />
              </Field>

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
                    ? `bg-gradient-to-r ${t.button} shadow-[0_8px_30px_rgba(255,255,255,0.08)]`
                    : "bg-white/10 text-slate-300 opacity-60"
                }`}
              >
                <span className="relative z-10">
                  {loading ? "Creating account…" : `Create ${role === "dealer" ? "Dealer" : "User"} account`}
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
                Already have an account?{" "}
                <Link to="/login" className={`${t.text} hover:underline`}>
                  Sign in
                </Link>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Vibe side */}
        <div className="hidden items-center justify-center lg:flex">
          {role === "user" ? <UserVibe /> : <DealerVibe />}
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, labelClass, children }) {
  return (
    <div className="space-y-1.5">
      <label className={`text-sm ${labelClass}`}>{label}</label>
      {children}
      {hint && <p className="text-xs text-red-300">{hint}</p>}
    </div>
  );
}

function UserVibe() {
  return (
    <motion.div
      className="relative mx-auto w-[85%] max-w-xl"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
    >
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 blur-2xl" />
      <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Fresh arrivals</h3>
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-200">Live</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="aspect-square rounded-2xl bg-white/10 ring-1 ring-white/10"
            />
          ))}
        </div>
        <p className="mt-5 text-sm text-slate-300">
          Drops, bundles, and curated picks. Sign up and start collecting.
        </p>
      </div>
    </motion.div>
  );
}

function DealerVibe() {
  return (
    <motion.div
      className="relative mx-auto w-[85%] max-w-xl"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
    >
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-fuchsia-400/20 to-indigo-400/20 blur-2xl" />
      <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Partner dashboard</h3>
          <span className="rounded-full bg-fuchsia-400/20 px-3 py-1 text-xs text-fuchsia-200">
            Dealer
          </span>
        </div>
        <div className="space-y-3">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="text-sm text-slate-300">Today’s Orders</div>
            <div className="mt-1 text-2xl font-semibold">132</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="text-sm text-slate-300">Conversion Rate</div>
            <div className="mt-1 text-2xl font-semibold">3.2%</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="text-sm text-slate-300">Top Category</div>
            <div className="mt-1 text-2xl font-semibold">Streetwear</div>
          </motion.div>
        </div>
        <p className="mt-5 text-sm text-slate-300">
          Grow your brand with powerful tools and reach our shopper network.
        </p>
      </div>
    </motion.div>
  );
}
