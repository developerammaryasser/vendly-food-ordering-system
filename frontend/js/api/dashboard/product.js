import { client } from "../../utils/client.js";
// Create product
export const createProduct = async (data) => {
  const res = await client("/products", data, "POST");
  return res;
};
// Get all products
export const getAllProducts = async () => {
  const res = await client("/products");
  return res;
};
// Update product
export const updateProduct = async (id, data) => {
  const res = await client(`/products/${id}`, data, "PATCH");
  return res;
};
// Delete product
export const deleteProduct = async (id) => {
  const res = await client(`/products/${id}`, null, "DELETE");
  return res;
};