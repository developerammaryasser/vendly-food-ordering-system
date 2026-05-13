import { getAllUsers, deleteUser } from "../api/dashboard/user.js";

document.addEventListener("DOMContentLoaded", async () => {
  const usersTableBody = document.getElementById("users-table-body");

  // Stats elements
  const totalUsersEl = document.getElementById("total-users");
  const adminUsersEl = document.getElementById("admin-users");
  const customerUsersEl = document.getElementById("customer-users");

  let users = [];

  const renderUsers = () => {
    usersTableBody.innerHTML = "";
    let adminCount = 0;
    let customerCount = 0;

    users.forEach((user) => {
      // Role is an enum: 'admin', 'customer'
      const roleStr = user.role === "admin" ? "Admin" : "Customer";
      
      if (user.role === "admin") adminCount++;
      else customerCount++;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><span class="role-badge role-${user.role}">${roleStr}</span></td>
        <td>
          <button class="btn-delete" data-id="${user.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      usersTableBody.appendChild(row);
    });

    // Update stats
    totalUsersEl.textContent = users.length;
    adminUsersEl.textContent = adminCount;
    customerUsersEl.textContent = customerCount;
  };

  const fetchAndRenderUsers = async () => {
    try {
      users = await getAllUsers();
      renderUsers();
    } catch (error) {
      console.error("Failed to fetch users:", error);
      usersTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Failed to load users.</td></tr>`;
    }
  };

  await fetchAndRenderUsers();

  // Delete functionality
  usersTableBody.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".btn-delete");
    if (deleteBtn) {
      const id = parseInt(deleteBtn.dataset.id);
      if (confirm("Are you sure you want to delete this user?")) {
        try {
          await deleteUser(id);
          users = users.filter((u) => u.id !== id);
          renderUsers();
        } catch (error) {
          alert("Failed to delete user: " + error.message);
        }
      }
    }
  });
});
