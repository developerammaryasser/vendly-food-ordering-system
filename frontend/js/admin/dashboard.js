document.addEventListener('DOMContentLoaded', async () => {
    // API Base URL
    const API_URL = 'http://localhost:3000'; // Adjust if needed
    
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
                fetch(`${API_URL}/api/orders`),
                fetch(`${API_URL}/api/products`),
                fetch(`${API_URL}/api/menus`)
            ]);
            orders = await ordersRes.json();
            products = await productsRes.json();
            menus = await menusRes.json();
        } catch (e) {
            console.warn("Could not fetch real data, using dummy data instead.");
        }

        // Fallback to Dummy Data if empty (for demonstration)
        if (orders.length === 0) {
            orders = [
                { id: 101, customer: { name: 'Ahmed Ali', email: 'ahmed@example.com' }, status: 'completed', totalPrice: 150.50, createdAt: new Date() },
                { id: 102, customer: { name: 'Sara Mohamed', email: 'sara@example.com' }, status: 'pending', totalPrice: 85.00, createdAt: new Date() },
                { id: 103, customer: { name: 'John Doe', email: 'john@example.com' }, status: 'completed', totalPrice: 210.00, createdAt: new Date() },
                { id: 104, customer: { name: 'Mona Hassan', email: 'mona@example.com' }, status: 'cancelled', totalPrice: 45.00, createdAt: new Date() },
                { id: 105, customer: { name: 'Omar Khaled', email: 'omar@example.com' }, status: 'pending', totalPrice: 120.00, createdAt: new Date() },
                { id: 106, customer: { name: 'Laila Ibrahem', email: 'laila@example.com' }, status: 'completed', totalPrice: 320.00, createdAt: new Date() }
            ];
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
                    <div style="font-weight: 500;">${order.customer.name}</div>
                    <div style="font-size: 0.75rem; color: #757575;">${order.customer.email}</div>
                </td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td style="font-weight: 600;">$${Number(order.totalPrice).toFixed(2)}</td>
                <td>
                    <button class="btn-view" onclick="window.location.href='./orders.html'">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
});
