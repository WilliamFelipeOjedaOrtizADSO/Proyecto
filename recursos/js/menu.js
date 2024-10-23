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

// Evento para el botón de cerrar sesión
document.getElementById('cerrar-sesion').addEventListener('click', function() {
    // Eliminar los datos de sesión
    localStorage.removeItem('documentoUsuario');
    localStorage.removeItem('usuario');
    // Redirigir al login
    window.location.href = 'index.html';
});
