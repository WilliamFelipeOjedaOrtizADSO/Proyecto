import { apiUrl } from './config.js';

// Función para obtener todas las zonas
async function obtenerZonas() {
    const response = await fetch(`${apiUrl}/zonas`);
    if (!response.ok) {
        throw new Error('Error al obtener las zonas');
    }
    return await response.json();
}

// Función para obtener los reportes
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

// Función para mostrar los reportes en la tabla
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

// Inicializar
mostrarReportes();


document.getElementById('btnvolver').addEventListener('click', function() {
    window.location.href = 'menu.html';
});