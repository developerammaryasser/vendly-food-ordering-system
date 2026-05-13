document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('user-form');
    const usersTableBody = document.getElementById('users-table-body');
    const dialogTitle = document.getElementById('dialog-title');
    const userIdInput = document.getElementById('user-id');

    // Stats elements
    const totalUsersEl = document.getElementById('total-users');
    const adminUsersEl = document.getElementById('admin-users');
    const customerUsersEl = document.getElementById('customer-users');

    // Mock data for initial display
    let users = [
        { id: 1, name: 'Ammar Yasser', email: 'ammaryasser.online@gmail.com', role: 'Admin' },
        { id: 2, name: 'John Doe', email: 'john@example.com', role: 'Customer' },
        { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'Customer' },
        { id: 4, name: 'Admin User', email: 'admin@vendly.com', role: 'Admin' }
    ];

    function renderUsers() {
        usersTableBody.innerHTML = '';
        let adminCount = 0;
        let customerCount = 0;

        users.forEach(user => {
            if (user.role === 'Admin') adminCount++;
            else customerCount++;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
                <td>
                    <button class="btn-edit" data-id="${user.id}">
                        <i class="fa-solid fa-pen"></i>
                    </button>
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
    }

    // Initial render
    renderUsers();

    // Handle form submission (Only for Editing now)
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!userIdInput.value) return; // Safety check: only allow if editing

        const formData = new FormData(userForm);
        const userData = {
            id: parseInt(userIdInput.value),
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role')
        };

        // Update existing user
        const index = users.findIndex(u => u.id === userData.id);
        if (index !== -1) {
            users[index] = userData;
        }

        renderUsers();
        closeUserDialog();
    });

    // Edit functionality
    usersTableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit');
        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            const user = users.find(u => u.id === id);
            if (user) {
                openEditDialog(user);
            }
        }

        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id);
            if (confirm('Are you sure you want to delete this user?')) {
                users = users.filter(u => u.id !== id);
                renderUsers();
            }
        }
    });

    function openEditDialog(user) {
        dialogTitle.textContent = 'Edit User';
        userIdInput.value = user.id;
        userForm.name.value = user.name;
        userForm.email.value = user.email;
        userForm.role.value = user.role;
        
        document.getElementById('user-form-overlay').classList.add('active');
    }

    function closeUserDialog() {
        userForm.reset();
        userIdInput.value = '';
        dialogTitle.textContent = 'Edit User'; // Default to Edit User as Add is gone
        document.getElementById('user-form-overlay').classList.remove('active');
    }

    // Reset form when clicking close button
    document.getElementById('user-form-close').addEventListener('click', () => {
        setTimeout(closeUserDialog, 300); // Wait for transition
    });
});
