import { loginUser } from "../api/loginUser.js";
import { errorMessageComponent } from "../components/errorMessage.js";

const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!loginForm.checkValidity()) {
    errorMessage.innerHTML = errorMessageComponent(
      "Please fill in all required fields",
    );
    return;
  }

  const formData = new FormData(loginForm);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await loginUser(data);
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    if (res.user.role === "admin") {
      window.location.href = "/admin-dashboard/";
    } else {
      window.location.href = "/dashboard.html";
    }
  } catch (error) {
    errorMessage.innerHTML = errorMessageComponent(
      error.response?.data.message || error.message,
    );
  }
});
