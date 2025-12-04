// src/api/dispatch.js
import { get, post } from "../lib/apiClient";

/**
 * Dispatch / hub operator APIs
 *
 * Note:
 * - get(path, opts) and post(path, payload, opts) come from your apiClient
 * - getHubOrders returns the backend response (res.data) — HubOrdersList expects { data: [...] } or an array
 */

/**
 * GET /api/hub/orders?hub_id=...&status=...
 * params: { status, page, limit, from_date, to_date, sort }
 */
export async function getHubOrders(hubId, params = {}) {
  const p = { hub_id: hubId, ...params };
  return await get("/api/hub/orders", { params: p });
}

/**
 * Internal assign-rider endpoint (usually called from backend jobs, but useful for testing/admin)
 * POST /dispatch/assign-rider
 */
export async function assignRider(payload) {
  return await post("/dispatch/assign-rider", payload);
}

/**
 * POST /api/hub/orders/:orderId/mark-packed
 * body: { packed_by }
 */
export async function markPacked(orderId, body = { packed_by: "operator" }) {
  return await post(`/api/hub/orders/${orderId}/mark-packed`, body);
}

/**
 * POST /api/hub/orders/:orderId/generate-otp
 */
export async function generateHandoverOtp(orderId) {
  return await post(`/api/hub/orders/${orderId}/generate-otp`);
}

/**
 * POST /api/hub/orders/:orderId/handover
 * body: { delivery_token, rider_id, handed_over_by }
 */
export async function handoverOrder(orderId, body) {
  return await post(`/api/hub/orders/${orderId}/handover`, body);
}

/**
 * admin helper to create partner job (for testing)
 * POST /api/internal/partners/:partnerName/create
 */
export async function createPartnerJob(partnerName, body) {
  return await post(`/api/internal/partners/${partnerName}/create`, body);
}
