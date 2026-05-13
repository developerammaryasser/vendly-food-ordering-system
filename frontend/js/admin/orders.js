import { getAllOrders } from "../api/dashboard/order.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Document Elements
  const totalOrdersKpi = document.getElementById("total-orders-kpi");
  const pendingOrdersKpi = document.getElementById("pending-orders-kpi");
  const completedOrdersKpi = document.getElementById("completed-orders-kpi");
  const cancelledOrdersKpi = document.getElementById("cancelled-orders-kpi");
  const ordersTableBody = document.getElementById("orders-table-body");

  try {
    // Fetch Orders
    const orders = await getAllOrders();

    // Calculate KPIs
    const totalOrders = orders.length;
    let pendingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    ordersTableBody.innerHTML = "";

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

      // Status Badge Styling (assuming standard badge classes if any, else plain text)
      let statusClass = "role-customer"; // fallback 
      if (order.status === "completed") statusClass = "role-admin"; // green-ish
      if (order.status === "cancelled") statusClass = "role-customer"; // red-ish or something
      // We'll just capitalize status for display
      const statusCapitalized = order.status.charAt(0).toUpperCase() + order.status.slice(1);

      row.innerHTML = `
        <td>${order.id}</td>
        <td>
          <strong>${order.customer?.name || "Unknown"}</strong><br>
          <small style="color: #666;">${order.customer?.phone || ""}</small>
        </td>
        <td>${itemsCount} item(s)</td>
        <td><span class="status-badge status-${order.status}">${statusCapitalized}</span></td>
        <td>$${Number(order.totalPrice).toFixed(2)}</td>
      `;
      ordersTableBody.appendChild(row);
    });

    // Update KPI UI
    totalOrdersKpi.textContent = totalOrders;
    pendingOrdersKpi.textContent = pendingOrders;
    completedOrdersKpi.textContent = completedOrders;
    cancelledOrdersKpi.textContent = cancelledOrders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    ordersTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Failed to load orders.</td></tr>`;
  }
});
