import { client } from "../../utils/client.js";

// Get all orders
export const getAllOrders = async () => {
  const res = await client("/orders");
  return res;
};

// Get current user's orders
export const getUserOrders = async () => {
  const res = await client("/orders/user", null, "GET");
  return res;
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  const res = await client(`/orders/${id}/status`, { status }, "PATCH");
  return res;
};
