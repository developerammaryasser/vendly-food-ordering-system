function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/login.html";
}
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

