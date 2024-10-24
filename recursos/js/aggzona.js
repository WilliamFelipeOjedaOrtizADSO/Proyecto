// admin_zonas.js

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
            window.location.href = 'zonas.html';
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
        if (!data || data.length === 0) throw new Error('No se encontraron zonas');
        return data;
    } catch (error) {
        console.error('Error al obtener las zonas:', error);
        document.getElementById('mensaje').textContent = 'Hubo un error al cargar las zonas.';
        return [];
    }
}

/**
 * Función para mostrar las zonas en la tabla.
 * @param {Array} zonas - Arreglo de zonas a mostrar.
 */
async function mostrarZonas(zonas = null) {
    if (!zonas) zonas = await obtenerZonas();
    const tablaBody = document.querySelector('#tabla-zonas tbody');
    tablaBody.innerHTML = ''; // Limpiar contenido previo.

    zonas.forEach(zona => {
        const fila = document.createElement('tr');

        // Columna ID.
        const celdaId = document.createElement('td');
        celdaId.textContent = zona.id;
        fila.appendChild(celdaId);

        // Columna Nombre.
        const celdaNombre = document.createElement('td');
        celdaNombre.textContent = zona.nombre;
        fila.appendChild(celdaNombre);

        // Columna Cantidad de Casilleros.
        const celdaCantidad = document.createElement('td');
        const cantidadCasilleros = zona.casilleros.length;
        celdaCantidad.textContent = cantidadCasilleros;
        fila.appendChild(celdaCantidad);

        // Columna Acciones.
        const celdaAcciones = document.createElement('td');

        // Botón Editar.
        const botonEditar = document.createElement('button');
        botonEditar.textContent = 'Editar';
        botonEditar.addEventListener('click', () => editarZona(zona.id));
        celdaAcciones.appendChild(botonEditar);

        // Botón Eliminar.
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.addEventListener('click', () => eliminarZona(zona.id));
        celdaAcciones.appendChild(botonEliminar);

        fila.appendChild(celdaAcciones);

        tablaBody.appendChild(fila);
    });
}

/**
 * Función para agregar una nueva zona.
 * @param {Event} event - Evento del formulario.
 */
async function agregarZona(event) {
    event.preventDefault();

    try {
        // Obtener valores del formulario.
        const nombreZona = document.getElementById('zona-nombre').value.trim();
        const cantidadCasilleros = parseInt(document.getElementById('cantidad-casilleros').value);

        if (!nombreZona || isNaN(cantidadCasilleros) || cantidadCasilleros <= 0) {
            document.getElementById('mensaje').textContent = 'Por favor ingresa datos válidos.';
            return;
        }

        // Obtener las zonas existentes.
        const zonas = await obtenerZonas();

        // Generar un nuevo ID para la zona.
        let nuevoId = String.fromCharCode(65 + zonas.length);

        // Generar casilleros según la cantidad ingresada.
        const casilleros = [];

        for (let i = 1; i <= cantidadCasilleros; i++) {
            casilleros.push({
                codigo: `${nuevoId}${i}`,
                ocupado: false,
                usuario: "",
                fechaOcupacion: "",
                historial: [],
                reportes: [],
                reportado: false
            });
        }

        // Crear la nueva zona.
        const nuevaZona = {
            id: nuevoId,
            nombre: nombreZona,
            casilleros: casilleros
        };

        // Guardar la nueva zona en el servidor.
        const response = await fetch(`${apiUrl}/zonas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaZona)
        });

        if (!response.ok) {
            throw new Error('Error al guardar la nueva zona');
        }

        document.getElementById('mensaje').textContent = `Zona "${nombreZona}" agregada exitosamente.`;
        document.getElementById('zona-form').reset();

        // Actualizar la lista de zonas.
        mostrarZonas();

    } catch (error) {
        console.error('Error al agregar la zona:', error);
        document.getElementById('mensaje').textContent = 'Hubo un problema al agregar la zona.';
    }
}

/**
 * Función para editar una zona existente.
 * @param {string} zonaId - ID de la zona a editar.
 */
async function editarZona(zonaId) {
    try {
        // Obtener la zona específica.
        const response = await fetch(`${apiUrl}/zonas/${zonaId}`);
        const zona = await response.json();

        // Solicitar nuevos datos al usuario.
        const nuevoNombre = prompt('Ingresa el nuevo nombre de la zona:', zona.nombre);
        const nuevaCantidadCasilleros = parseInt(prompt('Ingresa la nueva cantidad de casilleros:', zona.casilleros.length));

        if (!nuevoNombre || isNaN(nuevaCantidadCasilleros) || nuevaCantidadCasilleros <= 0) {
            alert('Datos inválidos.');
            return;
        }

        // Actualizar los datos de la zona.
        zona.nombre = nuevoNombre.trim();

        // Regenerar los casilleros según la nueva cantidad.
        const casilleros = [];

        for (let i = 1; i <= nuevaCantidadCasilleros; i++) {
            casilleros.push({
                codigo: `${zona.id}${i}`,
                ocupado: false,
                usuario: "",
                fechaOcupacion: "",
                historial: [],
                reportes: [],
                reportado: false
            });
        }

        zona.casilleros = casilleros;

        // Actualizar la zona en el servidor.
        const updateResponse = await fetch(`${apiUrl}/zonas/${zonaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(zona)
        });

        if (!updateResponse.ok) {
            throw new Error('Error al actualizar la zona');
        }

        alert('Zona actualizada exitosamente.');
        mostrarZonas();

    } catch (error) {
        console.error('Error al editar la zona:', error);
        alert('Hubo un error al editar la zona.');
    }
}

/**
 * Función para eliminar una zona existente.
 * @param {string} zonaId - ID de la zona a eliminar.
 */
async function eliminarZona(zonaId) {
    if (!confirm('¿Estás seguro de eliminar esta zona y todos sus casilleros?')) {
        return;
    }

    try {
        // Eliminar la zona del servidor.
        const response = await fetch(`${apiUrl}/zonas/${zonaId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar la zona');
        }

        alert('Zona eliminada exitosamente.');
        mostrarZonas();

    } catch (error) {
        console.error('Error al eliminar la zona:', error);
        alert('Hubo un error al eliminar la zona.');
    }
}

/**
 * Función para filtrar las zonas según los criterios ingresados.
 */
async function filtrarZonas() {
    const nombreFiltro = document.getElementById('filtro-nombre').value.trim().toLowerCase();
    const cantidadFiltro = parseInt(document.getElementById('filtro-casilleros').value);

    let zonas = await obtenerZonas();

    if (nombreFiltro) {
        zonas = zonas.filter(zona => zona.nombre.toLowerCase().includes(nombreFiltro));
    }

    if (!isNaN(cantidadFiltro)) {
        zonas = zonas.filter(zona => zona.casilleros.length >= cantidadFiltro);
    }

    mostrarZonas(zonas);
}

// Evento para el formulario de agregar zona.
document.getElementById('zona-form').addEventListener('submit', agregarZona);

// Evento para el botón de filtrar.
document.getElementById('filtrar-btn').addEventListener('click', filtrarZonas);

// Inicializar al cargar la página.
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    mostrarZonas();
});

// Evento para el botón de volver.
document.getElementById('btnvolver').addEventListener('click', function() {
    window.location.href = 'menu.html';
});
