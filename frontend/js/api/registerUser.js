import { client } from "../utils/client.js";

export const registerUser = async (data) => {
  const res = await client("/users/register", data, "POST");
  return res;
};
