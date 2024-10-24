// Función para verificar si el usuario tiene los elementos necesarios en el sessionStorage
function verificarAcceso() {
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));

    if (!usuario) {
        // Si no hay un usuario en sessionStorage, redirigir al login
        window.location.href = 'index.html';
    } else {
        // Verificar el roleId para asegurarse de que el usuario tenga acceso al menú de administrador
        if (usuario.roleId !== 2) { // 2 representa el rol de administrador en este caso
          Swal.fire({
            title: "Acceso Denegado",
            text: "No tienes permiso para acceder a esta sección. Serás redirigido nuevamente a tu sesión",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Volver a mi Sesión"
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: "Redirigiendo...",
                text: "Serás llevado a tu sesión.",
                icon: "success",
                timer: 2000, 
                willClose: () => {
                  window.location.href = 'zonas.html';
                }
              });
            } else {
              
              cerrarSesion(); 
            }
          });

          function cerrarSesion() {
          
            window.location.href = 'index.html';
            sessionStorage.removeItem('usuario');
            sessionStorage.removeItem('documentoUsuario');
            console.log("Cerrando sesión");
          }


        }
    }
}

// Verificar acceso al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    verificarAcceso();

    // Manejar los toggles del sidebar y las notificaciones
    const sidebarToggle = document.getElementById('sidebarToggle');
    const notificationsToggle = document.getElementById('notificationsToggle');
    const cerrarSesionButton = document.querySelector('.menu > #cerrar-sesion');

    // Toggle del sidebar
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('active');
        });
    }

    // Toggle de notificaciones
    if (notificationsToggle) {
        notificationsToggle.addEventListener('click', function() {
            const notificationsMenu = document.getElementById('notificationsMenu');
            notificationsMenu.classList.toggle('active');
        });
    }

    // Manejar la funcionalidad de cerrar sesión
    if (cerrarSesionButton) {
        cerrarSesionButton.addEventListener('click', function() {
            // Eliminar los datos de la sesión
            sessionStorage.removeItem('usuario');
            sessionStorage.removeItem('documentoUsuario');
            console.log("Cerrando sesión");

            // Redirigir al login
            window.location.href = 'index.html';
        });
    }
});
