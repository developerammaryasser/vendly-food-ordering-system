export function initDialog(triggerSelector, overlaySelector, closeSelector) {
    const triggerBtns = document.querySelectorAll(triggerSelector);
    const overlay = document.querySelector(overlaySelector);
    const closeBtn = document.querySelector(closeSelector);

    if (!overlay) return;

    // Open dialog
    triggerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            overlay.classList.add('active');
        });
    });

    // Close dialog
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
        });
    }

    // Close dialog when clicking outside the container
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
}
