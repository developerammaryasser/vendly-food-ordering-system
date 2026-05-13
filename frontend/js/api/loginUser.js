import { client } from "../utils/client.js";

// Login
export const loginUser = async (data) => {
  try {
    const res = await client("/users/login", data, "POST");
    return res;
  } catch (error) {
    throw error;
  }
};
