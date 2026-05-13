import { client } from "./client.js";

const checkUserValidation = async () => {
  try {
    const data = await client("/users/current-user", null, "GET");
    return { success: true, message: "Success to fetch user data", data };
  } catch (error) {
    return (
      error.response?.data ||
      error.message || {
        success: false,
        message: "Failed to validate user",
      }
    );
  }
};
async function auth() {
  const user = localStorage.getItem("user") || null;
  const token = localStorage.getItem("token") || null;
  if (!user || !token) {
    window.location.href = "/login.html";
  }
  // Check if user is valid
  const { success, message, data: userData } = await checkUserValidation();
  if (!success) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  }
  // Update user in local storage
  localStorage.setItem("user", JSON.stringify(userData));
  // Check if user is admin
  if (userData.role === "admin") {
    if (!window.location.href.includes("admin-dashboard")) {
      window.location.href = "/admin-dashboard";
    }
  } else {
    if (window.location.href.includes("admin-dashboard")) {
      window.location.href = "/dashboard.html";
    }
  }
  return { user, token };
}
auth();
