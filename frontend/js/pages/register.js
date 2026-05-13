import { registerUser } from "../api/registerUser.js";
import { errorMessageComponent } from "../components/errorMessage.js";

const registerForm = document.getElementById("register-form");
const errorMessage = document.getElementById("error-message");
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!registerForm.checkValidity()) {
    errorMessage.innerHTML = errorMessageComponent(
      "Please fill in all required fields",
    );
    return;
  }
  const formData = new FormData(registerForm);
  const data = Object.fromEntries(formData.entries());
  // Check if passwords match
  if (data.password !== data.confirmPassword) {
    errorMessage.innerHTML = errorMessageComponent("Passwords do not match");
    return;
  }
  try {
    const res = await registerUser(data);
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    window.location.href = "/dashboard.html";
  } catch (error) {
    errorMessage.innerHTML = errorMessageComponent(
      error.response?.data.message || error.message,
    );
  }
});
