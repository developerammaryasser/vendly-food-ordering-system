import { client } from "../../utils/client.js";
// Create Menu
export const createMenu = async (data) => {
  const res = await client("/menus", data, "POST");
  return res;
};
// Get All Menus
export const getAllMenus = async () => {
  const res = await client("/menus");
  return res;
};
// Remove Menu
export const removeMenu = async (id) => {
  const res = await client(`/menus/${id}`, null, "DELETE");
  return res;
};