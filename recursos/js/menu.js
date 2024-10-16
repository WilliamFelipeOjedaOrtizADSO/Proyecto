document.addEventListener("DOMContentLoaded", function() {
    // Toggle sidebar visibility
    document.getElementById('sidebarToggle').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    });

    // Toggle notifications menu visibility
    document.getElementById('notificationsToggle').addEventListener('click', function() {
        const notificationsMenu = document.getElementById('notificationsMenu');
        notificationsMenu.classList.toggle('active');
    });
});
