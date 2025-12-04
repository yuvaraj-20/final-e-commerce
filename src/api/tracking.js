// src/api/tracking.js
import { get } from "../lib/apiClient";

/**
 * Tracking domain API
 */

// Full order (used by TrackOrder page)
export async function getOrder(orderId) {
  // returns { success, data: { ... } } or similar shape your backend uses
  return await get(`/api/orders/${orderId}`);
}

// Fast location polling (should be backed by Redis / fast store)
export async function getOrderLocation(orderId) {
  return await get(`/api/orders/${orderId}/location`);
}

// Public tracking page (if backend provides public JSON)
export async function getPublicTrack(orderId, token = null) {
  const url = token ? `/track/${orderId}?token=${token}` : `/track/${orderId}`;
  return await get(url);
}
