// historial_casilleros.js

import { apiUrl } from './config.js';

/**
 * Función para verificar si el usuario ha iniciado sesión y tiene permisos de administrador.
 */
function verificarSesion() {
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'index.html';
    } else {
        if (usuario.roleId !== 2) {
            alert("No tienes permiso para acceder a esta sección.");
            sessionStorage.removeItem('usuario');
            sessionStorage.removeItem('documentoUsuario');
            window.location.href = 'zonas.html';
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
        if (!response.ok) {
            throw new Error('Error al obtener las zonas');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

/**
 * Función para cargar las opciones del select de zonas.
 */
async function cargarZonas() {
    const zonas = await obtenerZonas();
    const zonaSelect = document.getElementById('zonaSelect');

    const opcionTodas = document.createElement('option');
    opcionTodas.value = '';
    opcionTodas.textContent = 'Todas';
    zonaSelect.appendChild(opcionTodas);

    zonas.forEach(zona => {
        const option = document.createElement('option');
        option.value = zona.id;
        option.textContent = zona.nombre;
        zonaSelect.appendChild(option);
    });
}

/**
 * Función para obtener el historial completo de casilleros.
 * @returns {Promise<Array>} Un arreglo con el historial.
 */
async function obtenerHistorial() {
    const zonas = await obtenerZonas();
    const historial = [];

    zonas.forEach(zona => {
        zona.casilleros.forEach(casillero => {
            if (casillero.historial && casillero.historial.length > 0) {
                casillero.historial.forEach(entry => {
                    historial.push({
                        zonaId: zona.id,
                        zonaNombre: zona.nombre,
                        codigoCasillero: casillero.codigo,
                        nombreUsuario: entry.nombreUsuario,
                        fechaIngreso: entry.fechaIngreso,
                        fechaLiberacion: entry.fechaLiberacion
                    });
                });
            }
        });
    });

    return historial;
}

/**
 * Función para mostrar el historial en la tabla.
 */
async function mostrarHistorial() {
    const historial = await obtenerHistorial();
    const tablaBody = document.querySelector('#historialTable tbody');
    tablaBody.innerHTML = '';

    historial.forEach(entry => {
        const fila = document.createElement('tr');

        const celdaZona = document.createElement('td');
        celdaZona.textContent = entry.zonaNombre;
        fila.appendChild(celdaZona);

        const celdaCodigo = document.createElement('td');
        celdaCodigo.textContent = entry.codigoCasillero;
        fila.appendChild(celdaCodigo);

        const celdaUsuario = document.createElement('td');
        celdaUsuario.textContent = entry.nombreUsuario;
        fila.appendChild(celdaUsuario);

        const celdaIngreso = document.createElement('td');
        celdaIngreso.textContent = entry.fechaIngreso ? new Date(entry.fechaIngreso).toLocaleString() : '';
        fila.appendChild(celdaIngreso);

        const celdaLiberacion = document.createElement('td');
        celdaLiberacion.textContent = entry.fechaLiberacion ? new Date(entry.fechaLiberacion).toLocaleString() : '';
        fila.appendChild(celdaLiberacion);

        tablaBody.appendChild(fila);
    });
}

/**
 * Función para aplicar filtros al historial.
 * @param {Array} historial - Arreglo del historial completo.
 * @returns {Array} Historial filtrado.
 */
function aplicarFiltros(historial) {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    const zonaId = document.getElementById('zonaSelect').value;
    const codigoCasillero = document.getElementById('codigoCasillero').value.trim().toLowerCase();

    return historial.filter(entry => {
        let pasaFiltro = true;

        if (fechaInicio) {
            pasaFiltro = pasaFiltro && new Date(entry.fechaIngreso) >= new Date(fechaInicio);
        }

        if (fechaFin) {
            pasaFiltro = pasaFiltro && new Date(entry.fechaIngreso) <= new Date(fechaFin);
        }

        if (zonaId) {
            pasaFiltro = pasaFiltro && entry.zonaId === zonaId;
        }

        if (codigoCasillero) {
            pasaFiltro = pasaFiltro && entry.codigoCasillero.toLowerCase().includes(codigoCasillero);
        }

        return pasaFiltro;
    });
}

// Evento para el botón de filtrar.
document.getElementById('filtrarBtn').addEventListener('click', async () => {
    const historial = await obtenerHistorial();
    const historialFiltrado = aplicarFiltros(historial);

    const tablaBody = document.querySelector('#historialTable tbody');
    tablaBody.innerHTML = '';

    historialFiltrado.forEach(entry => {
        const fila = document.createElement('tr');

        const celdaZona = document.createElement('td');
        celdaZona.textContent = entry.zonaNombre;
        fila.appendChild(celdaZona);

        const celdaCodigo = document.createElement('td');
        celdaCodigo.textContent = entry.codigoCasillero;
        fila.appendChild(celdaCodigo);

        const celdaUsuario = document.createElement('td');
        celdaUsuario.textContent = entry.nombreUsuario;
        fila.appendChild(celdaUsuario);

        const celdaIngreso = document.createElement('td');
        celdaIngreso.textContent = entry.fechaIngreso ? new Date(entry.fechaIngreso).toLocaleString() : '';
        fila.appendChild(celdaIngreso);

        const celdaLiberacion = document.createElement('td');
        celdaLiberacion.textContent = entry.fechaLiberacion ? new Date(entry.fechaLiberacion).toLocaleString() : '';
        fila.appendChild(celdaLiberacion);

        tablaBody.appendChild(fila);
    });
});

// Inicializar al cargar la página.
document.addEventListener('DOMContentLoaded', async () => {
    verificarSesion();
    await cargarZonas();
    await mostrarHistorial();

    document.getElementById('btnvolver').addEventListener('click', function() {
        window.location.href = 'menu.html';
    });
});
