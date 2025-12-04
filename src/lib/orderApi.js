// src/lib/orderApi.js
import { post } from "./apiClient"; // you already use this in useStore.js

// Create order
export async function createOrder(payload) {
  const response = await post("/orders", payload);
  return response.data; // { success: true, data: { ...order } }
}

// Estimate delivery fee (optional use later)
export async function estimateOrder(payload) {
  const response = await post("/orders/estimate", payload);
  return response.data; // { success: true, data: { ...routing } }
}
