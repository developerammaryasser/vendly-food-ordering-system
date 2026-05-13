import { getAllProducts } from "../api/dashboard/product.js";
import { client, UPLOAD_URL } from "../utils/client.js";
import { errorMessageComponent } from "../components/errorMessage.js";

document.addEventListener("DOMContentLoaded", async () => {
  // ==========================================
  // DOM Elements
  // ==========================================
  const orderItemsBody     = document.getElementById("order-items-body");
  const btnClearCart       = document.getElementById("btn-clear-cart");
  const btnCheckout        = document.getElementById("btn-checkout");
  const customerNameInput  = document.getElementById("customer-name");
  const customerPhoneInput = document.getElementById("customer-phone");
  const customerEmailInput = document.getElementById("customer-email");
  const orderNotesInput    = document.getElementById("order-notes");
  const subtotalEl         = document.getElementById("subtotal-value");
  const taxEl              = document.getElementById("tax-value");
  const discountEl         = document.getElementById("discount-value");
  const grandTotalEl       = document.getElementById("grand-total-value");
  const toastEl            = document.getElementById("cart-toast");
  const errorEl            = document.getElementById("error-message");
  const btnEditOrder       = document.getElementById("btn-edit-order");

  // State
  let allProducts    = [];
  let discountPercent = 0;

  // ==========================================
  // Helpers
  // ==========================================
  const getCart  = () => JSON.parse(localStorage.getItem("cart")) || [];
  const saveCart = (cart) => localStorage.setItem("cart", JSON.stringify(cart));

  const showToast = (message, duration = 2500) => {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), duration);
  };

  const fmt = (num) => `$${Number(num).toFixed(2)}`;

  // ==========================================
  // Auto-fill user info if logged in
  // ==========================================
  const loadUserInfo = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    // Name
    if (user.firstName && user.lastName) {
      customerNameInput.value = `${user.firstName} ${user.lastName}`;
    } else if (user.name) {
      customerNameInput.value = user.name;
    }

    // Email
    if (user.email) customerEmailInput.value = user.email;

    // Phone
    if (user.phone) customerPhoneInput.value = user.phone;
  };
  loadUserInfo();

  // ==========================================
  // Fetch all products (for image + description)
  // ==========================================
  try {
    allProducts = await getAllProducts();
  } catch (err) {
    console.warn("Could not fetch products:", err);
  }

  const findProduct = (id) =>
    allProducts.find((p) => String(p.id) === String(id));

  // ==========================================
  // Calculate Totals
  // ==========================================
  const calculateTotals = () => {
    const cart = getCart();
    let subtotal = 0;
    cart.forEach((item) => { subtotal += item.price * item.quantity; });

    const tax      = subtotal * 0.1;
    const discount = subtotal * (discountPercent / 100);
    const grand    = subtotal + tax - discount;

    subtotalEl.textContent  = fmt(subtotal);
    taxEl.textContent       = fmt(tax);
    discountEl.textContent  = fmt(discount);
    grandTotalEl.textContent = fmt(grand);

    btnCheckout.disabled = cart.length === 0;
  };

  // ==========================================
  // Render Cart Items
  // ==========================================
  const renderCart = () => {
    const cart = getCart();
    orderItemsBody.innerHTML = "";

    if (cart.length === 0) {
      orderItemsBody.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">
            <i class="fa-solid fa-cart-shopping"></i>
          </div>
          <h3>Your cart is empty</h3>
          <p>Browse our menu and add some delicious items!</p>
          <a href="./index.html" class="btn-shop-now">
            <i class="fa-solid fa-utensils"></i> Browse Menu
          </a>
        </div>
      `;
      btnClearCart.style.display = "none";
      if (btnEditOrder) btnEditOrder.style.display = "none";
      calculateTotals();
      return;
    }

    btnClearCart.style.display = "inline-flex";
    if (btnEditOrder) btnEditOrder.style.display = "inline-flex";

    cart.forEach((item, index) => {
      const fullProduct = findProduct(item.id);
      const imageFile   = fullProduct ? fullProduct.image : item.image;
      const imageSrc    = imageFile ? `${UPLOAD_URL}products/${imageFile}` : "";
      const description = fullProduct
        ? fullProduct.description
        : item.description || "Delicious menu item";
      const itemSubtotal = item.price * item.quantity;

      const el = document.createElement("div");
      el.classList.add("order-item");
      el.style.animationDelay = `${index * 0.05}s`;

      el.innerHTML = `
        <div class="order-item-image">
          ${
            imageSrc
              ? `<img src="${imageSrc}" alt="${item.name}" />`
              : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                   <i class="fa-solid fa-image" style="font-size:1.4rem;color:#ccc;"></i>
                 </div>`
          }
        </div>
        <div class="order-item-details">
          <div class="order-item-title-row">
            <h4 class="order-item-name">${item.name}</h4>
          </div>
          <p class="order-item-description">${description}</p>
          <div class="order-item-bottom">
            <span class="order-item-price">${fmt(itemSubtotal)}</span>
            <div style="display:flex;align-items:center;">
              <div class="order-item-qty-controls">
                <button class="qty-decrease" data-index="${index}" title="Decrease">
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span class="item-qty-value">${item.quantity}</span>
                <button class="qty-increase" data-index="${index}" title="Increase">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
              <button class="btn-remove-item" data-index="${index}" title="Remove item">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      orderItemsBody.appendChild(el);
    });

    calculateTotals();
  };

  // ==========================================
  // Event: Item qty / remove
  // ==========================================
  orderItemsBody.addEventListener("click", (e) => {
    const inc = e.target.closest(".qty-increase");
    if (inc) {
      const cart = getCart();
      cart[Number(inc.dataset.index)].quantity += 1;
      saveCart(cart);
      renderCart();
      return;
    }

    const dec = e.target.closest(".qty-decrease");
    if (dec) {
      const cart = getCart();
      const idx  = Number(dec.dataset.index);
      if (cart[idx].quantity > 1) {
        cart[idx].quantity -= 1;
      } else {
        cart.splice(idx, 1);
        showToast("Item removed from cart");
      }
      saveCart(cart);
      renderCart();
      return;
    }

    const rem = e.target.closest(".btn-remove-item");
    if (rem) {
      const cart = getCart();
      const idx  = Number(rem.dataset.index);
      const name = cart[idx].name;
      cart.splice(idx, 1);
      saveCart(cart);
      renderCart();
      showToast(`${name} removed`);
    }
  });

  // ==========================================
  // Event: Clear Cart
  // ==========================================
  btnClearCart.addEventListener("click", () => {
    if (!getCart().length) return;
    if (confirm("Clear all items from your cart?")) {
      saveCart([]);
      renderCart();
      showToast("Cart cleared");
    }
  });

  // ==========================================
  // Event: Place Order
  // ==========================================
  btnCheckout.addEventListener("click", async () => {
    // Clear previous error
    errorEl.innerHTML = "";

    const cart = getCart();
    if (!cart.length) {
      errorEl.innerHTML = errorMessageComponent("Your cart is empty!");
      return;
    }

    // Validate required fields
    const name  = customerNameInput.value.trim();
    const phone = customerPhoneInput.value.trim();
    const email = customerEmailInput.value.trim();

    if (!name) {
      errorEl.innerHTML = errorMessageComponent("Please enter your name");
      customerNameInput.focus();
      return;
    }
    if (!phone) {
      errorEl.innerHTML = errorMessageComponent("Please enter your phone number");
      customerPhoneInput.focus();
      return;
    }
    if (!email) {
      errorEl.innerHTML = errorMessageComponent("Please enter your email");
      customerEmailInput.focus();
      return;
    }

    // Build payload matching CreateOrderDto
    const payload = {
      customer: {
        name,
        email,
        phone,
        address: "Takeaway",
        city:    "N/A",
        state:   "N/A",
        zip:     "N/A",
        notes:   orderNotesInput.value.trim(),
      },
      orderItems: cart.map((item) => ({
        product:   Number(item.id),
        name:     item.name,
        quantity: item.quantity,
      })),
    };

    // Disable button while sending
    btnCheckout.disabled  = true;
    btnCheckout.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Placing…`;

    try {
      await client("/orders", payload, "POST");
      saveCart([]);
      discountPercent = 0;
      renderCart();
      showToast("🎉 Order placed successfully!");
    } catch (err) {
      console.error("Order failed:", err);
      errorEl.innerHTML = errorMessageComponent(err.message || "Something went wrong. Please try again.");
      btnCheckout.disabled  = false;
      btnCheckout.innerHTML = `<i class="fa-solid fa-check"></i> Place Order`;
    }
  });

  // ==========================================
  // Initial Render
  // ==========================================
  renderCart();
});
