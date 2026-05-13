import { client } from "../../utils/client.js";

// Get all orders
export const getAllOrders = async () => {
  const res = await client("/orders");
  return res;
};
