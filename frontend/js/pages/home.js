import { getAllMenus } from "../api/dashboard/menu.js";
import { getAllProducts } from "../api/dashboard/product.js";
import { UPLOAD_URL } from "../utils/client.js";

document.addEventListener("DOMContentLoaded", async () => {
  const productsBody = document.getElementById("products-body");
  const menusBody = document.getElementById("menus-body");
  const cartCounter = document.querySelector("#cart-counter");

  const updateCartCounter = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartCounter.textContent = cart.length;
  };
  updateCartCounter();

  // Fetch data
  const menus = await getAllMenus();
  const products = await getAllProducts();

  // Render menus
  const renderMenus = () => {
    menus.forEach((menu) => {
      const menuItem = document.createElement("li");
      menuItem.innerHTML = `
        <button class="menu-btn" data-id="${menu.id}">${menu.name}</button>
      `;
      menusBody.appendChild(menuItem);
    });
  };
  renderMenus();

  // Render products
  const renderProducts = (productsToRender) => {
    productsBody.innerHTML = "";
    if (productsToRender.length === 0) {
      productsBody.innerHTML = "<p class='text-center'>No products found</p>";
      return;
    }

    productsToRender.forEach((product) => {
      const productItem = document.createElement("div");
      productItem.classList.add("product-item");
      productItem.innerHTML = `
          <div class="product-card">
            <!-- Product Image -->
            <div class="product-image">
              <img src="${UPLOAD_URL + "/products/" + product.image}" alt="${product.name}" />
            </div>
            <!-- Product Info -->
            <div class="product-info">
              <h5 class="product-category">${product.menu.name}</h5>
              <h3 class="product-name">${product.name}</h3>
              <p class="product-description">
                ${product.description}
              </p>
              <p class="product-price">$${product.price} / serving</p>
              <div class="product-card-actions">
                <button class="add-to-cart" id="add-to-cart-btn">Add to Cart</button>
                <div class="quantity-controls">
                  <button class="quantity-btn" id="minus-btn">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <span class="quantity" id="quantity">1</span>
                  <button class="quantity-btn" id="plus-btn">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
      `;
      productItem.innerHTML = `
          <div class="product-card">
            <div class="product-image">
              <img src="${UPLOAD_URL}/products/${product.image}" alt="${product.name}" />
            </div>
            <div class="product-info">
              <h5 class="product-category">${product.menu.name}</h5>
              <h3 class="product-name">${product.name}</h3>
              <p class="product-description">${product.description}</p>
              <p class="product-price">$${product.price} / serving</p>
              
              <div class="product-card-actions">
                <button 
                  class="add-to-cart-btn add-to-cart" 
                  data-id="${product.id}" 
                  data-name="${product.name}" 
                  data-price="${product.price}"
                  data-image="${product.image}"
                  data-description="${product.description}">
                  Add to Cart
                </button>
                <div class="quantity-controls">
                  <button class="quantity-btn minus-btn"><i class="fa-solid fa-minus"></i></button>
                  <span class="quantity quantity-val">1</span>
                  <button class="quantity-btn plus-btn"><i class="fa-solid fa-plus"></i></button>
                </div>
              </div>
            </div>
          </div>
      `;
      productsBody.appendChild(productItem);
    });
  };
  renderProducts(products);

  // ==========================================
  // Handle ALL Clicks inside Products Body (Event Delegation)
  // ==========================================
  productsBody.addEventListener("click", (e) => {
    const plusBtn = e.target.closest(".plus-btn");
    if (plusBtn) {
      const qtySpan = plusBtn.previousElementSibling;
      qtySpan.textContent = Number(qtySpan.textContent) + 1;
      return;
    }

    const minusBtn = e.target.closest(".minus-btn");
    if (minusBtn) {
      const qtySpan = minusBtn.nextElementSibling;
      if (Number(qtySpan.textContent) > 1) {
        qtySpan.textContent = Number(qtySpan.textContent) - 1;
      }
      return;
    }

    const addToCartBtn = e.target.closest(".add-to-cart-btn");
    if (addToCartBtn) {
      const cardActions = addToCartBtn.closest(".product-card-actions");
      const qtySpan = cardActions.querySelector(".quantity-val");
      const quantity = Number(qtySpan.textContent);

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const productObj = {
        id: addToCartBtn.dataset.id,
        name: addToCartBtn.dataset.name,
        price: Number(addToCartBtn.dataset.price),
        image: addToCartBtn.dataset.image,
        description: addToCartBtn.dataset.description,
        quantity: quantity,
      };

      const existingProduct = cart.find((item) => item.id === productObj.id);
      if (existingProduct) {
        existingProduct.quantity += productObj.quantity;
      } else {
        cart.push(productObj);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCounter();

      qtySpan.textContent = 1;

      const originalText = addToCartBtn.textContent;
      addToCartBtn.textContent = "Added!";
      setTimeout(() => {
        addToCartBtn.textContent = originalText;
      }, 1000);
    }
  });

  // Handle menu filtering
  menusBody.addEventListener("click", (e) => {
    const menuBtn =
      e.target.closest(".menu-btn") || e.target.closest("#menu-btn");

    if (menuBtn) {
      document
        .querySelector("#menus-body button.active")
        ?.classList.remove("active");
      menuBtn.classList.add("active");

      const menuId = menuBtn.dataset.id;
      if (menuId === "all") {
        renderProducts(products);
      } else {
        const filteredProducts = products.filter(
          (product) => product.menu.id === Number(menuId),
        );
        renderProducts(filteredProducts);
      }
    }
  });
});
