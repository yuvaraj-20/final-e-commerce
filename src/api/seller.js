// src/api/seller.js
import { get, post } from "../lib/apiClient";

/**
 * Seller domain API
 */

export async function getSellersNearby({ lat, lng, category = null, radius = 3000, page = 1, limit = 50 }) {
  const params = { lat, lng, radius, page, limit };
  if (category) params.category = category;
  return await get("/api/sellers", { params });
}

export async function getSellerProducts(sellerId, params = {}) {
  return await get(`/api/sellers/${sellerId}/products`, { params });
}

export async function acceptOrder(sellerId, body) {
  return await post(`/api/sellers/${sellerId}/accept_order`, body);
}

export async function rejectOrder(sellerId, body) {
  return await post(`/api/sellers/${sellerId}/reject_order`, body);
}

export async function updateWorkingHours(sellerId, body) {
  return await post(`/api/sellers/${sellerId}/working-hours`, body);
}

export async function notifySeller(sellerId, payload) {
  return await post(`/api/sellers/${sellerId}/notify`, payload);
}
