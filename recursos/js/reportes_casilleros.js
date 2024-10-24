// admin_reportes.js

import { apiUrl } from './config.js';

/**
 * Función para verificar si el usuario ha iniciado sesión y tiene permisos de administrador.
 */
function verificarSesion() {
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

/**
 * Función para obtener todas las zonas.
 * @returns {Promise<Array>} Un arreglo de zonas.
 */
async function obtenerZonas() {
    try {
        const response = await fetch(`${apiUrl}/zonas`);
        if (!response.ok) throw new Error('Error al obtener las zonas');
        return await response.json();
    } catch (error) {
        console.error('Error al obtener las zonas:', error);
        return [];
    }
}

/**
 * Función para obtener los reportes de los casilleros.
 * @returns {Promise<Array>} Un arreglo de reportes.
 */
async function obtenerReportes() {
    const zonas = await obtenerZonas();
    const reportes = [];

    zonas.forEach(zona => {
        zona.casilleros.forEach(casillero => {
            if (casillero.reportes && casillero.reportes.length > 0) {
                casillero.reportes.forEach(reporte => {
                    reportes.push({
                        zona: zona.nombre,
                        codigoCasillero: casillero.codigo,
                        nombreUsuario: reporte.nombreUsuario,
                        fechaReporte: reporte.fechaReporte,
                        motivo: reporte.motivo
                    });
                });
            }
        });
    });

    return reportes;
}

/**
 * Función para mostrar los reportes en la tabla.
 */
async function mostrarReportes() {
    const reportes = await obtenerReportes();
    const tablaBody = document.querySelector('#reportesTable tbody');
    tablaBody.innerHTML = '';

    reportes.forEach(reporte => {
        const fila = document.createElement('tr');

        const celdaZona = document.createElement('td');
        celdaZona.textContent = reporte.zona;
        fila.appendChild(celdaZona);

        const celdaCodigo = document.createElement('td');
        celdaCodigo.textContent = reporte.codigoCasillero;
        fila.appendChild(celdaCodigo);

        const celdaUsuario = document.createElement('td');
        celdaUsuario.textContent = reporte.nombreUsuario;
        fila.appendChild(celdaUsuario);

        const celdaFecha = document.createElement('td');
        celdaFecha.textContent = new Date(reporte.fechaReporte).toLocaleString();
        fila.appendChild(celdaFecha);

        const celdaMotivo = document.createElement('td');
        celdaMotivo.textContent = reporte.motivo;
        fila.appendChild(celdaMotivo);

        tablaBody.appendChild(fila);
    });
}

// Inicializar al cargar la página.
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    mostrarReportes();

    document.getElementById('btnvolver').addEventListener('click', function() {
        window.location.href = 'menu.html';
    });
});
