// admin_casilleros.js

import { apiUrl } from './config.js';

let itemsPorPagina = 10; // Número de casilleros por página
let paginaActual = 1; // Página actual
let casillerosFiltrados = []; // Arreglo para almacenar los casilleros filtrados

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
 * Función para obtener las zonas desde el servidor.
 * @returns {Promise<Array>} Un arreglo de zonas.
 */
async function obtenerZonas() {
    try {
        const response = await fetch(`${apiUrl}/zonas`);
        if (!response.ok) throw new Error('Error al obtener las zonas');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener las zonas:', error);
        return []; // Retornar un arreglo vacío en caso de error.
    }
}

/**
 * Función para llenar el combobox de zonas.
 */
async function llenarComboboxZonas() {
    const zonas = await obtenerZonas();
    const zonaSelect = document.getElementById('zona-select');

    zonas.forEach(zona => {
        const option = document.createElement('option');
        option.value = zona.id;
        option.textContent = zona.nombre;
        zonaSelect.appendChild(option);
    });
}

/**
 * Función para mostrar los casilleros aplicando filtros y paginación.
 */
async function mostrarCasilleros() {
    const zonas = await obtenerZonas();

    if (!zonas || zonas.length === 0) {
        console.warn('No se encontraron zonas.');
        return; // Salir si no hay zonas.
    }

    casillerosFiltrados = []; // Reiniciar el arreglo de casilleros filtrados.
    const tablaBody = document.querySelector('#tabla-casilleros tbody');
    tablaBody.innerHTML = ''; // Limpiar contenido previo.

    // Obtener valores de los filtros.
    const filtroZona = document.getElementById('filtro-zona').value;
    const filtroCodigo = document.getElementById('filtro-codigo').value.trim().toLowerCase();
    const filtroEstado = document.getElementById('filtro-estado').value;

    // Filtrar casilleros según los criterios.
    zonas.forEach(zona => {
        if (!zona.casilleros || !Array.isArray(zona.casilleros)) {
            console.warn(`Zona ${zona.id} no contiene casilleros válidos.`);
            return; // Saltar a la siguiente zona.
        }

        zona.casilleros.forEach(casillero => {
            let mostrar = true;

            if (filtroZona && zona.id !== filtroZona) {
                mostrar = false;
            }

            if (filtroCodigo && !casillero.codigo.toLowerCase().includes(filtroCodigo)) {
                mostrar = false;
            }

            if (filtroEstado) {
                if (filtroEstado === 'disponible' && casillero.ocupado) {
                    mostrar = false;
                }
                if (filtroEstado === 'ocupado' && !casillero.ocupado) {
                    mostrar = false;
                }
            }

            if (mostrar) {
                casillero.zonaNombre = zona.nombre; // Agregar nombre de zona al casillero.
                casillero.zonaId = zona.id; // Guardar id de la zona.
                casillerosFiltrados.push(casillero); // Agregar casillero filtrado.
            }
        });
    });

    // Mostrar la página actual.
    mostrarPagina(paginaActual);
}

/**
 * Función para mostrar los casilleros de la página actual.
 * @param {number} pagina - Número de página a mostrar.
 */
function mostrarPagina(pagina) {
    const tablaBody = document.querySelector('#tabla-casilleros tbody');
    tablaBody.innerHTML = ''; // Limpiar contenido previo.

    const inicio = (pagina - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const casillerosAPresentar = casillerosFiltrados.slice(inicio, fin);

    casillerosAPresentar.forEach(casillero => {
        const fila = document.createElement('tr');

        // Columna Código.
        const celdaCodigo = document.createElement('td');
        celdaCodigo.textContent = casillero.codigo;
        fila.appendChild(celdaCodigo);

        // Columna Zona.
        const celdaZona = document.createElement('td');
        celdaZona.textContent = casillero.zonaNombre;
        fila.appendChild(celdaZona);

        // Columna Estado.
        const celdaEstado = document.createElement('td');
        celdaEstado.textContent = casillero.ocupado ? 'Ocupado' : 'Disponible';
        fila.appendChild(celdaEstado);

        // Columna Acciones.
        const celdaAcciones = document.createElement('td');

        // Botón Editar.
        const botonEditar = document.createElement('button');
        botonEditar.textContent = 'Editar';
        botonEditar.addEventListener('click', () => editarCasillero(casillero.zonaId, casillero.codigo));
        celdaAcciones.appendChild(botonEditar);

        // Botón Eliminar.
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.addEventListener('click', () => eliminarCasillero(casillero.zonaId, casillero.codigo));
        celdaAcciones.appendChild(botonEliminar);

        fila.appendChild(celdaAcciones);
        tablaBody.appendChild(fila);
    });

    // Actualizar controles de paginación.
    actualizarPaginacion();
}

/**
 * Función para actualizar los controles de paginación.
 */
function actualizarPaginacion() {
    const numeroPagina = document.getElementById('numeroPagina');
    if (!numeroPagina) {
        console.error('Elemento numeroPagina no encontrado');
        return;
    }

    const totalPaginas = Math.ceil(casillerosFiltrados.length / itemsPorPagina);
    numeroPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;

    // Habilitar o deshabilitar botones de navegación.
    document.getElementById('btnAnterior').disabled = paginaActual === 1;
    document.getElementById('btnSiguiente').disabled = paginaActual >= totalPaginas;
}

/**
 * Función para editar un casillero.
 * @param {string} zonaId - ID de la zona.
 * @param {string} codigoCasillero - Código del casillero.
 */
function editarCasillero(zonaId, codigoCasillero) {
    // Implementar lógica de edición.
    alert(`Editar casillero ${codigoCasillero} en zona ${zonaId}`);
}

/**
 * Función para eliminar un casillero.
 * @param {string} zonaId - ID de la zona.
 * @param {string} codigoCasillero - Código del casillero.
 */
function eliminarCasillero(zonaId, codigoCasillero) {
    // Implementar lógica de eliminación.
    alert(`Eliminar casillero ${codigoCasillero} en zona ${zonaId}`);
}

// Manejadores de eventos para la paginación.
document.getElementById('btnAnterior').addEventListener('click', () => {
    if (paginaActual > 1) {
        paginaActual--;
        mostrarPagina(paginaActual);
    }
});

document.getElementById('btnSiguiente').addEventListener('click', () => {
    const totalPaginas = Math.ceil(casillerosFiltrados.length / itemsPorPagina);
    if (paginaActual < totalPaginas) {
        paginaActual++;
        mostrarPagina(paginaActual);
    }
});

// Manejador para el botón de filtrar.
document.getElementById('filtrar-btn').addEventListener('click', () => {
    paginaActual = 1; // Reiniciar a la primera página al aplicar filtros.
    mostrarCasilleros();
});

// Inicializar el script al cargar la página.
document.addEventListener('DOMContentLoaded', async () => {
    verificarSesion();
    await llenarComboboxZonas();
    await mostrarCasilleros();
});

// Evento para el botón de volver.
document.getElementById('btnvolver').addEventListener('click', function() {
    window.location.href = 'menu.html';
});
