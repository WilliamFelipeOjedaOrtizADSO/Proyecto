import { apiUrl } from './config.js';

// Función para obtener las zonas desde el servidor
async function obtenerZonas() {
    try {
        const response = await fetch(`${apiUrl}/zonas`);

        if (!response.ok) {
            throw new Error('Error al obtener las zonas');
        }

        const zonas = await response.json();

        if (!zonas || zonas.length === 0) {
            throw new Error('No se encontraron zonas en la respuesta');
        }

        return zonas;
    } catch (error) {
        console.error('Error al obtener las zonas:', error);
        throw error;
    }
}

// Función para mostrar las zonas en la página
async function mostrarZonas() {
    try {
        const zonas = await obtenerZonas();

        const contenedorZonas = document.getElementById("zonas-container");

        // Limpiamos el contenedor antes de mostrar las nuevas zonas
        contenedorZonas.innerHTML = '';

        // Mostrar las zonas como botones en el DOM
        zonas.forEach(zona => {
            const botonZona = document.createElement("button");
            botonZona.className = 'boton-zona';
            botonZona.textContent = zona.nombre;

            // Añadir un atributo data-id para identificar la zona al hacer clic
            botonZona.setAttribute('data-id', zona.id);

            // Añadir evento click al botón
            botonZona.addEventListener('click', () => {
                // Redirigir a la página de casilleros de la zona seleccionada
                window.location.href = `casilleros.html?zonaId=${zona.id}`;
            });

            contenedorZonas.appendChild(botonZona);
        });
    } catch (error) {
        console.error('Error al mostrar las zonas:', error);

        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Hubo un problema al mostrar las zonas.";

        // Limpiamos el contenedor antes de mostrar el error
        const contenedorZonas = document.getElementById("zonas-container");
        contenedorZonas.innerHTML = '';

        contenedorZonas.appendChild(errorMessage);
    }
}

// Llamar a la función para mostrar las zonas cuando se carga la página
document.addEventListener('DOMContentLoaded', mostrarZonas);

document.getElementById('cerrar-sesion').addEventListener('click', function() {
    window.location.href = 'index.html';
});