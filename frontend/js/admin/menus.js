import { createMenu, getAllMenus, removeMenu } from "../api/dashboard/menu.js";
import { initDialog } from "../components/dialog.js";
import { errorMessageComponent } from "../components/errorMessage.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize the menu dialog
  initDialog("#btn-add-menu", "#menu-form-overlay", "#menu-form-close");

  const menuForm = document.getElementById("menu-form");
  const menusInputContainer = document.getElementById("menus-input-container");
  const addMenuRowBtn = document.getElementById("add-menu-row");
  const menusTableBody = document.getElementById("menus-table-body");
  let errorBox = document.getElementById("error-box");

  // Stats elements
  const totalMenusEl = document.getElementById("total-menus");
  const activeMenusEl = document.getElementById("active-menus");
  const totalItemsEl = document.getElementById("total-items");

  // Fetch menus

  let menus = await getAllMenus();

  function renderMenus() {
    menusTableBody.innerHTML = "";
    let totalItemsCount = 0;

    menus.forEach((menu) => {
      totalItemsCount += menu.products.length;
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${menu.name}</td>
                <td>${menu.products.length}</td>
                <td>
                    <button class="btn-delete" data-id="${menu.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
      menusTableBody.appendChild(row);
    });

    // Update stats
    totalMenusEl.textContent = menus.length;
    activeMenusEl.textContent = menus.length;
    totalItemsEl.textContent = totalItemsCount;
  }

  // Initial render
  renderMenus();

  // Menu Form
  menuForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(menuForm);
    const menuNames = formData.getAll("menu-names[]");
    // check if all menu names are unique
    const uniqueMenuNames = new Set(menuNames);
    errorBox.innerHTML = "";
    if (uniqueMenuNames.size !== menuNames.length) {
      errorBox.innerHTML = errorMessageComponent("Menu names must be unique.");
      return;
    }
    try {
      await createMenu({ names: menuNames });
      menuForm.reset();
      document.getElementById("menu-form-overlay").classList.remove("active");
      renderMenus();
    } catch (error) {
      errorBox.innerHTML = errorMessageComponent(error.message);
    }
  });
  // Add new menu name row in form
  addMenuRowBtn.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "menu-input-row";
    row.innerHTML = `
            <div class="input-box">
                <label class="form-label">Menu Name</label>
                <input
                    class="form-input"
                    type="text"
                    name="menu-names[]"
                    placeholder="e.g. Breakfast Menu"
                    required
                />
            </div>
            <button type="button" class="btn-remove-row">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
    menusInputContainer.appendChild(row);
  });

  // Remove menu name row in form
  menusInputContainer.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".btn-remove-row");
    if (removeBtn) {
      removeBtn.closest(".menu-input-row").remove();
    }
  });

  // Delete functionality
  menusTableBody.addEventListener("click", async (e) => {
    if (e.target.closest(".btn-delete")) {
      const id = parseInt(e.target.closest(".btn-delete").dataset.id);
      try {
        await removeMenu(id);
        menus = menus.filter((m) => m.id !== id);
        renderMenus();
      } catch (error) {
        console.log(error);
      }
    }
  });
});
