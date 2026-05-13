import { client } from "../../utils/client.js";

// Get all users
export const getAllUsers = async () => {
  const res = await client("/users");
  return res;
};

// Delete user
export const deleteUser = async (id) => {
  const res = await client(`/users/${id}`, null, "DELETE");
  return res;
};
