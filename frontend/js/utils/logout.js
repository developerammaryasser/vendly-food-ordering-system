function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/login.html";
}
document.getElementById("logout-btn").addEventListener("click", logout);
