import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../api/dashboard/product.js";
import { initDialog } from "../components/dialog.js";
import { getAllMenus } from "../api/dashboard/menu.js";
import { UPLOAD_URL } from "../utils/client.js";

import { errorMessageComponent } from "../components/errorMessage.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize the product dialog
  initDialog(
    "#btn-add-product",
    "#product-form-overlay",
    "#product-form-close",
  );

  // Document Elements
  const totalProducts = document.getElementById("total-products");
  const availableProducts = document.getElementById("available-products");
  const outOfStockProducts = document.getElementById("out-of-stock-products");
  const totalRevenue = document.getElementById("total-revenue");
  const productsTableBody = document.getElementById("products-table-body");
  const productForm = document.getElementById("product-form");
  const errorBox = document.getElementById("error-box");
  const productMenu = document.getElementById("product-menu");
  const productImageInput = document.getElementById("product-image");
  const imagePreview = document.getElementById("image-preview");
  const btnSubmitProduct = document.getElementById("btn-submit-product");

  // Fetch & Render Menus
  const renderMenus = async () => {
    const menus = await getAllMenus();
    menus.forEach((menu) => {
      const option = document.createElement("option");
      option.value = menu.id;
      option.textContent = menu.name;
      productMenu.appendChild(option);
    });
  };
  await renderMenus();

  // Fetch & Render Products
  let products = await getAllProducts();

  function renderProducts() {
    productsTableBody.innerHTML = "";
    let totalItemsCount = 0;

    products.forEach((product) => {
      totalItemsCount += product.itemsCount || 0;
      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="image-cell">
            <img src="${UPLOAD_URL + "products/" + product.image}" alt="${product.name}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">
        </td>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.menu?.name || "N/A"}</td>
        <td>$${product.price}</td>
        <td>${product.stock}</td>
        <td>
            <button class="btn-edit" data-id="${product.id}">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-delete" data-id="${product.id}">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>
      `;
      productsTableBody.appendChild(row);
    });

    // Update stats
    totalProducts.textContent = products.length;
    availableProducts.textContent = products.filter((p) => p.stock > 0).length;
    outOfStockProducts.textContent = products.filter(
      (p) => p.stock === 0,
    ).length;
    totalRevenue.textContent = `$${products.reduce((acc, p) => acc + Number(p.price), 0)}`;
  }

  renderProducts();

  // ==========================================
  // Image Preview Logic
  // ==========================================
  productImageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      imagePreview.src = URL.createObjectURL(file);
      imagePreview.style.display = "block";
    } else {
      imagePreview.style.display = "none";
      imagePreview.src = "";
    }
  });

  // ==========================================
  // Add Product Button Logic (Reset Form)
  // ==========================================
  document.getElementById("btn-add-product").addEventListener("click", () => {
    productForm.reset();
    document.getElementById("product-form-title").textContent = "Add Product";
    productImageInput.required = true;
    imagePreview.style.display = "none";
    imagePreview.src = "";
    delete productForm.dataset.editId; // Remove edit mode flag
  });

  // ==========================================
  // Unified Form Submit (Handles both Create & Edit)
  // ==========================================
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(productForm);
    const productName = formData.get("product-name");
    const productPrice = formData.get("product-price");
    const productImage = formData.get("product-image"); // File object
    const productMenu = formData.get("product-menu");
    const productDescription = formData.get("product-description");
    const productStock = formData.get("product-stock");

    const isEditMode = !!productForm.dataset.editId;

    // Validation (Image is only required in Create mode)
    if (
      !productName ||
      !productPrice ||
      !productMenu ||
      !productDescription ||
      !productStock ||
      (!isEditMode && (!productImage || !productImage.name))
    ) {
      errorBox.innerHTML = errorMessageComponent(
        "Please fill all the required fields",
      );
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("name", productName);
      submitData.append("price", productPrice);
      submitData.append("menu", productMenu);
      submitData.append("description", productDescription);
      submitData.append("stock", productStock);

      // Append image only if the user selected a new one
      if (productImage && productImage.name) {
        submitData.append("image", productImage);
      }

      if (isEditMode) {
        // --- UPDATE LOGIC ---
        const productId = productForm.dataset.editId;
        const updatedProduct = await updateProduct(productId, submitData);

        // Update the array element instead of pushing a duplicate
        const index = products.findIndex((p) => p.id === Number(productId));
        if (index !== -1) {
          products[index] = updatedProduct;
        }
      } else {
        // --- CREATE LOGIC ---
        const newProduct = await createProduct(submitData);
        products.push(newProduct);
      }

      // Cleanup & Close Dialog
      productForm.reset();
      delete productForm.dataset.editId;
      document
        .getElementById("product-form-overlay")
        .classList.remove("active");
      errorBox.innerHTML = "";
      renderProducts(); // Re-render the table with new data
    } catch (error) {
      errorBox.innerHTML = errorMessageComponent(error.message);
    }
  });

  // ==========================================
  // Table Event Delegation (Edit & Delete Buttons)
  // ==========================================
  productsTableBody.addEventListener("click", async (e) => {
    // 1. Handle Edit Button Click
    const editBtn = e.target.closest(".btn-edit");
    if (editBtn) {
      btnSubmitProduct.textContent = "Update Product";
      const productId = editBtn.dataset.id;
      const product = products.find((p) => p.id === Number(productId));

      if (!product) return;

      document.getElementById("product-form-overlay").classList.add("active");
      document.getElementById("product-form-title").textContent =
        "Edit Product";

      // Fill form data
      productForm.elements["product-name"].value = product.name;
      productForm.elements["product-price"].value = product.price;
      productForm.elements["product-menu"].value =
        product.menu?.id || product.menu;
      productForm.elements["product-description"].value = product.description;
      productForm.elements["product-stock"].value = product.stock;

      // Image handling for edit mode
      productImageInput.required = false;
      imagePreview.src = UPLOAD_URL + "products/" + product.image;
      imagePreview.style.display = "block";

      // Set edit mode flag
      productForm.dataset.editId = product.id;
    }

    // 2. Handle Delete Button Click
    const deleteBtn = e.target.closest(".btn-delete");
    if (deleteBtn) {
      const productId = deleteBtn.dataset.id;

      if (confirm("Are you sure you want to delete this product?")) {
        try {
          await deleteProduct(productId);

          // Remove from local array and re-render
          products = products.filter((p) => p.id !== Number(productId));
          renderProducts();
        } catch (error) {
          alert("Failed to delete product: " + error.message);
        }
      }
    }
  });
});
