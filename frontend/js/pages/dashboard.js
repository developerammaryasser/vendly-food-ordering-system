import { getUserOrders, updateOrderStatus } from "../api/dashboard/order.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Document Elements
  const totalOrdersKpi = document.getElementById("total-orders-kpi");
  const pendingOrdersKpi = document.getElementById("pending-orders-kpi");
  const completedOrdersKpi = document.getElementById("completed-orders-kpi");
  const cancelledOrdersKpi = document.getElementById("cancelled-orders-kpi");
  const ordersTableBody = document.getElementById("orders-table-body");

  // Get current user from local storage
  const currentUser = JSON.parse(localStorage.getItem("user"));
  
  if (!currentUser || !currentUser.email) {
    ordersTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">User not found. Please log in again.</td></tr>`;
    return;
  }

  const loadOrders = async () => {
    try {
      // Fetch User's Orders
      const orders = await getUserOrders();

      // Calculate KPIs
      const totalOrders = orders.length;
      let pendingOrders = 0;
      let completedOrders = 0;
      let cancelledOrders = 0;

      ordersTableBody.innerHTML = "";

      if (orders.length === 0) {
        ordersTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">You have no orders yet.</td></tr>`;
      }

      orders.forEach((order) => {
        // Update KPIs
        if (order.status === "pending") pendingOrders++;
        if (order.status === "completed") completedOrders++;
        if (order.status === "cancelled") cancelledOrders++;

        // Create row
        const row = document.createElement("tr");

        // Calculate total items (sum of quantities)
        const itemsCount = order.orderItems?.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        ) || 0;

        // Status Badge Styling
        const statusCapitalized = order.status.charAt(0).toUpperCase() + order.status.slice(1);

        row.innerHTML = `
          <td>${order.id}</td>
          <td>${itemsCount} item(s)</td>
          <td><span class="status-badge status-${order.status}">${statusCapitalized}</span></td>
          <td>$${Number(order.totalPrice).toFixed(2)}</td>
          <td class="actions">
            ${
              order.status === "pending"
                ? `
              <button class="btn-icon cancel-btn" data-id="${order.id}" title="Cancel Order">
                <i class="fa-solid fa-xmark" style="color: red;"></i>
              </button>
            `
                : ""
            }
          </td>
        `;
        ordersTableBody.appendChild(row);
      });

      // Update KPI UI
      if (totalOrdersKpi) totalOrdersKpi.textContent = totalOrders;
      if (pendingOrdersKpi) pendingOrdersKpi.textContent = pendingOrders;
      if (completedOrdersKpi) completedOrdersKpi.textContent = completedOrders;
      if (cancelledOrdersKpi) cancelledOrdersKpi.textContent = cancelledOrders;

      // Add event listeners to the cancel buttons
      const cancelButtons = document.querySelectorAll(".cancel-btn");

      cancelButtons.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          if (confirm("Are you sure you want to cancel this order?")) {
            const id = e.currentTarget.getAttribute("data-id");
            try {
               await updateOrderStatus(id, "cancelled");
               loadOrders(); // Reload the data
            } catch (error) {
               alert("Failed to cancel order.");
               console.error(error);
            }
          }
        });
      });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      ordersTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Failed to load orders.</td></tr>`;
    }
  };

  loadOrders();
});
