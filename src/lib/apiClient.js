// src/lib/apiClient.js
import axios from "axios";
import Cookies from "js-cookie";

/* ========= ENV ========= */
export const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || "sanctum").toLowerCase();
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const LOGIN_PATH    = import.meta.env.VITE_LOGIN_PATH    || "/login";
const REGISTER_PATH = import.meta.env.VITE_REGISTER_PATH || "/register";
const LOGOUT_PATH   = import.meta.env.VITE_LOGOUT_PATH   || "/logout";
const ME_PATH       = import.meta.env.VITE_ME_PATH       || "/api/user";

/* ========= AXIOS ========= */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: AUTH_MODE === "sanctum",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

/* ========= Helpers (Sanctum) ========= */
export async function ensureCsrf() {
  if (AUTH_MODE === "sanctum") {
    // Request Laravel Sanctum CSRF cookie
    await api.get("/sanctum/csrf-cookie");
  }
}

export function readXsrfToken() {
  return decodeURIComponent(Cookies.get("XSRF-TOKEN") || "");
}

export async function sanctumPost(path, payload = {}, opts = {}) {
  await ensureCsrf();
  const token = readXsrfToken();
  try {
    const res = await api.post(path, payload, {
      headers: { "X-XSRF-TOKEN": token },
      ...opts,
    });
    return res.data;
  } catch (err) {
    // rethrow with original error so caller can handle
    throw err;
  }
}

/* ========= Token Storage (for Bearer mode) ========= */
let apiToken = null;

export function setApiToken(token) {
  apiToken = token;
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.Authorization;
  }
}

/* ========= Role Mapping ========= */
export function mapRoleForBackend(role) {
  if (!role) return role;
  const r = String(role).toLowerCase();
  if (r === "user") return "customer";
  if (r === "dealer") return "seller";
  return r;
}

/* ========= Convenience wrappers ========= */
/* Generic GET that returns data or throws - useful in hooks */
export async function get(path, opts = {}) {
  try {
    const res = await api.get(path, opts);
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function post(path, payload = {}, opts = {}) {
  try {
    const res = await api.post(path, payload, opts);
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function del(path, opts = {}) {
  try {
    const res = await api.delete(path, opts);
    return res.data;
  } catch (err) {
    throw err;
  }
}

/* ========= Public API (signup/login/logout/me) ========= */
export async function signup(payload) {
  const cleanPayload = { ...payload, role: mapRoleForBackend(payload.role) };

  if (AUTH_MODE === "sanctum") {
    return await sanctumPost(REGISTER_PATH, cleanPayload);
  } else {
    const data = await post("/api/token-register", cleanPayload);
    if (data?.token) setApiToken(data.token);
    return data;
  }
}

export async function login({ role, identifier, password }) {
  const id = (identifier || "").trim();
  const isEmail = /@/.test(id);

  const cleanPayload = {
    role: mapRoleForBackend(role),
    [isEmail ? "email" : "phone"]: id,
    password,
  };

  if (AUTH_MODE === "sanctum") {
    return await sanctumPost(LOGIN_PATH, cleanPayload);
  } else {
    const data = await post("/api/token-login", cleanPayload);
    if (data?.token) setApiToken(data.token);
    return data;
  }
}

export async function logout() {
  if (AUTH_MODE === "sanctum") {
    await sanctumPost(LOGOUT_PATH);
  } else {
    await post("/api/token-logout");
    setApiToken(null);
  }
}

export async function me() {
  const { data } = await api.get(ME_PATH);
  return data;
}

/* default export for convenience */
export default {
  api,
  ensureCsrf,
  sanctumPost,
  get,
  post,
  del,
  setApiToken,
  signup,
  login,
  logout,
  me,
};
