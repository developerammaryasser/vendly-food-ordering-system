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
  // Bind logout button immediately
  const bindLogout = () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login.html";
      };
    }
  };
  bindLogout();

  const user = localStorage.getItem("user") || null;
  const token = localStorage.getItem("token") || null;
  if (!user || !token) {
    window.location.href = "/login.html";
    return;
  }
  // Check if user is valid
  const { success, message, data: userData } = await checkUserValidation();
  if (!success) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login.html";
    return;
  }
  // Update user in local storage
  localStorage.setItem("user", JSON.stringify(userData));

  // Dynamically update user details in the sidebar
  const accountNameEl = document.querySelector(".account-name");
  const accountEmailEl = document.querySelector(".account-email");
  if (accountNameEl && userData && userData.name) {
    const logoutBtn = document.getElementById("logout-btn");
    accountNameEl.textContent = userData.name + " ";
    if (logoutBtn) {
      accountNameEl.appendChild(logoutBtn);
    }
  }
  if (accountEmailEl && userData && userData.email) {
    accountEmailEl.textContent = userData.email;
  }

  // Re-bind logout in case the logout button was moved or recreated
  bindLogout();

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

