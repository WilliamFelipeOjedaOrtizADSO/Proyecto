import { apiUrl } from './config.js';

// Función para obtener los estudiantes desde el servidor
async function obtenerEstudiantes() {
    try {
        const response = await fetch(`${apiUrl}/users`);

        if (!response.ok) {
            throw new Error('Error al obtener los estudiantes');
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            throw new Error('No se encontraron estudiantes en la respuesta');
        }

        return data; // Devuelve los estudiantes obtenidos
    } catch (error) {
        console.error('Error al obtener los estudiantes:', error);
        throw error;
    }
}

// Función para mostrar los estudiantes en la tabla
function mostrarEstudiantes(estudiantes) {
    const tabla = document.getElementById("tablaEstudiantes");
    tabla.innerHTML = ''; // Limpiar la tabla antes de mostrar los resultados

    estudiantes.forEach(estudiante => {
        const fila = document.createElement("tr");

        const nombreCelda = document.createElement("td");
        nombreCelda.textContent = estudiante.nombre;
        fila.appendChild(nombreCelda);

        const fichaCelda = document.createElement("td");
        fichaCelda.textContent = estudiante.ficha;
        fila.appendChild(fichaCelda);

        const telefonoCelda = document.createElement("td");
        telefonoCelda.textContent = estudiante.telefono;
        fila.appendChild(telefonoCelda);

        const emailCelda = document.createElement("td");
        emailCelda.textContent = estudiante.email;
        fila.appendChild(emailCelda);

        const documentoCelda = document.createElement("td");
        documentoCelda.textContent = estudiante.documento;
        fila.appendChild(documentoCelda);

        const tipoDocumentoCelda = document.createElement("td");
        tipoDocumentoCelda.textContent = estudiante.tipoDocumento;
        fila.appendChild(tipoDocumentoCelda);

        tabla.appendChild(fila);
    });
}

// Función para filtrar los estudiantes según los criterios seleccionados
function filtrarEstudiantes() {
    const filtroSeleccionado = document.getElementById('filtroSeleccionado').value.toLowerCase();
    const valorFiltro = document.getElementById('valorFiltro').value.toLowerCase();

    obtenerEstudiantes().then(estudiantes => {
        const estudiantesFiltrados = estudiantes.filter(estudiante => {
            const valorCampo = estudiante[filtroSeleccionado]?.toLowerCase() || '';
            return valorCampo.includes(valorFiltro);
        });

        mostrarEstudiantes(estudiantesFiltrados);
    }).catch(error => {
        console.error('Error al filtrar los estudiantes:', error);
    });
}

// Añadir evento al botón de filtrar
document.getElementById('filtrarBtn').addEventListener('click', filtrarEstudiantes);

// Mostrar todos los estudiantes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    obtenerEstudiantes().then(mostrarEstudiantes);
});
