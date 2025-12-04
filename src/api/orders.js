// src/api/orders.js
import { get, post } from "../lib/apiClient";

/**
 * Orders domain API
 */

export async function createOrder(payload) {
  // returns server response (usually { success, data: {...} })
  return await post("/api/orders", payload);
}

export async function estimateOrder(payload) {
  // simulate=true optional
  return await post("/api/orders/estimate", payload);
}

export async function listOrders(params = {}) {
  // GET /api/orders
  // note: apiClient.get wrapper not exported here; use get for GET routes
  const query = Object.keys(params).length ? { params } : undefined;
  return await get("/api/orders", query);
}

export async function getOrder(orderId) {
  return await get(`/api/orders/${orderId}`);
}

export async function cancelOrder(orderId, body = {}) {
  return await post(`/api/orders/${orderId}/cancel`, body);
}
