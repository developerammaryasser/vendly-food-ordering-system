import { getAllOrders, updateOrderStatus } from '../api/dashboard/order.js';
import { getAllProducts } from '../api/dashboard/product.js';
import { getAllMenus } from '../api/dashboard/menu.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const kpiRevenue = document.querySelector('#kpi-revenue .value');
    const kpiOrders = document.querySelector('#kpi-orders .value');
    const kpiProducts = document.querySelector('#kpi-products .value');
    const kpiMenus = document.querySelector('#kpi-menus .value');
    const ordersTableBody = document.querySelector('#recent-orders-table tbody');
    const currentDateEl = document.querySelector('#current-date');

    // Set Current Date
    if (currentDateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // Colors from Design System
    const colors = {
        primary: '#f8833e',
        success: '#2e7d32',
        pending: '#ffa000',
        danger: '#c62828',
        gray: '#757575',
        chartBg: ['#f8833e', '#4caf50', '#f44336', '#2196f3', '#9c27b0']
    };

    try {
        // Fetch All Data in Parallel
        let orders = [], products = [], menus = [];
        try {
            const [ordersRes, productsRes, menusRes] = await Promise.all([
                getAllOrders(),
                getAllProducts(),
                getAllMenus()
            ]);
            orders = ordersRes;
            products = productsRes;
            menus = menusRes;
        } catch (e) {
        }
        if (products.length === 0) products = new Array(12).fill({});
        if (menus.length === 0) menus = new Array(4).fill({});

        // 1. Update KPIs
        const totalRevenue = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + Number(o.totalPrice), 0);
        
        kpiRevenue.textContent = `$${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        kpiOrders.textContent = orders.length;
        kpiProducts.textContent = products.length;
        kpiMenus.textContent = menus.length;

        // 2. Process Data for Status Chart
        const statusCounts = {
            pending: orders.filter(o => o.status === 'pending').length,
            completed: orders.filter(o => o.status === 'completed').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length
        };

        renderStatusChart(statusCounts);

        // 3. Process Data for Revenue Chart
        renderRevenueChart(orders);

        // 4. Render Recent Orders Table
        renderRecentOrders(orders);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }

    function renderStatusChart(data) {
        const ctx = document.getElementById('statusChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Completed', 'Cancelled'],
                datasets: [{
                    data: [data.pending, data.completed, data.cancelled],
                    backgroundColor: [colors.pending, colors.success, colors.danger],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                },
                cutout: '70%'
            }
        });
    }

    function renderRevenueChart(orders) {
        const completedRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.totalPrice), 0);
        const pendingRevenue = orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + Number(o.totalPrice), 0);
        const cancelledRevenue = orders.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + Number(o.totalPrice), 0);

        const ctx = document.getElementById('revenueChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Completed', 'Pending', 'Cancelled'],
                datasets: [{
                    label: 'Revenue by Status ($)',
                    data: [completedRevenue, pendingRevenue, cancelledRevenue],
                    backgroundColor: [colors.success, colors.pending, colors.danger],
                    borderRadius: 6,
                    barThickness: 40
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { drawBorder: false, color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function renderRecentOrders(orders) {
        const recent = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);
        
        ordersTableBody.innerHTML = recent.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>
                    <div style="font-weight: 500;">${order.customer?.name || 'Unknown'}</div>
                    <div style="font-size: 0.75rem; color: #757575;">${order.customer?.email || ''}</div>
                </td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td style="font-weight: 600;">$${Number(order.totalPrice).toFixed(2)}</td>
                <td class="actions">
                    ${
                      order.status === "pending"
                        ? `
                      <button class="btn-icon complete-btn" data-id="${order.id}" title="Complete">
                        <i class="fa-solid fa-check" style="color: green;"></i>
                      </button>
                      <button class="btn-icon cancel-btn" data-id="${order.id}" title="Cancel">
                        <i class="fa-solid fa-xmark" style="color: red;"></i>
                      </button>
                    `
                        : ""
                    }
                </td>
            </tr>
        `).join('');

        // Add event listeners to the new buttons
        const completeButtons = document.querySelectorAll(".complete-btn");
        const cancelButtons = document.querySelectorAll(".cancel-btn");

        completeButtons.forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                await updateOrderStatus(id, "completed");
                window.location.reload();
            });
        });

        cancelButtons.forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                await updateOrderStatus(id, "cancelled");
                window.location.reload();
            });
        });
    }
});
