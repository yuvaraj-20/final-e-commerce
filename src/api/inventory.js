// src/api/inventory.js
import { get, post } from "../lib/apiClient";

/**
 * Inventory / Hub domain API
 */

export async function listHubs(params = {}) {
  return await get("/api/hubs", { params });
}

export async function getHubInventory(hubId, params = {}) {
  return await get(`/api/hubs/${hubId}/inventory`, { params });
}

export async function reserveHubInventory(hubId, payload) {
  return await post(`/api/hubs/${hubId}/inventory/reserve`, payload);
}

export async function releaseHubReservation(hubId, payload) {
  return await post(`/api/hubs/${hubId}/inventory/release`, payload);
}
