import { apiUrl } from './config.js';

const cerrarSesionButton = document.querySelector('#cerrar-sesion');


// Función para obtener el parámetro zonaId de la URL
function obtenerZonaId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('zonaId');
}

// Función para obtener todas las zonas desde el servidor
async function obtenerZonas() {
    try {
        const response = await fetch(`${apiUrl}/zonas`);
        if (!response.ok) throw new Error('Error al obtener las zonas');
        return await response.json();
    } catch (error) {
        console.error('Error al obtener las zonas:', error);
        throw error;
    }
}

// Función para obtener la zona seleccionada desde el servidor
async function obtenerZona(zonaId) {
    try {
        const response = await fetch(`${apiUrl}/zonas/${zonaId}`);

        if (!response.ok) {
            throw new Error('Error al obtener la zona');
        }

        const zona = await response.json();

        if (!zona || !zona.casilleros) {
            throw new Error('No se encontraron casilleros en la respuesta');
        }

        return zona;
    } catch (error) {
        console.error('Error al obtener la zona:', error);
        throw error;
    }
}

// Función para obtener el nombre del usuario basado en su documento
function obtenerNombreUsuario(documento) {
    // Intentar obtener el usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario && usuario.documento === documento) {
        return usuario.nombre;
    }
    // Si no está en localStorage, devolver 'Desconocido' o implementar lógica para obtenerlo del servidor
    return "Desconocido";
}

// Función para mostrar los casilleros en la página
async function mostrarCasilleros() {
    try {
        const zonaId = obtenerZonaId();

        if (!zonaId) {
            throw new Error('No se proporcionó un zonaId válido');
        }

        const documentoUsuario = localStorage.getItem('documentoUsuario');

        const zona = await obtenerZona(zonaId);

        const contenedorCasilleros = document.getElementById("casilleros-container");

        // Limpiamos el contenedor antes de mostrar los casilleros
        contenedorCasilleros.innerHTML = '';

        // Actualizamos el título de la zona
        const tituloZona = document.querySelector('.casilleros__title');
        tituloZona.textContent = `Casilleros de la Zona: ${zona.nombre}`;

        // Crear un contenedor para los botones
        const gridCasilleros = document.createElement("div");
        gridCasilleros.className = 'casilleros__grid';

        zona.casilleros.forEach(casillero => {
            const botonCasillero = document.createElement("button");
            botonCasillero.classList.add('casilleros__button-locker');
            botonCasillero.textContent = casillero.codigo;

            // Verificar el estado del casillero
            if (casillero.ocupado) {
                if (casillero.usuario === documentoUsuario) {
                    // Casillero ocupado por el usuario actual
                    botonCasillero.classList.add('casillero--propio');
                } else {
                    // Casillero ocupado por otro usuario
                    botonCasillero.classList.add('casillero--ocupado');
                    botonCasillero.disabled = true;
                }
            } else {
                // Casillero disponible
                botonCasillero.classList.add('casillero--disponible');
            }

            // Añadir evento click al botón
            botonCasillero.addEventListener('click', async () => {
                // Solicitar número de documento al usuario
                const documentoIngresado = prompt('Por favor, ingrese su número de documento:');

                // Validar el documento ingresado
                if (documentoIngresado === documentoUsuario) {
                    if (casillero.ocupado) {
                        if (casillero.usuario === documentoUsuario) {
                            // Liberar el casillero
                            await liberarCasillero(zonaId, casillero.codigo);
                            alert(`Casillero ${casillero.codigo} liberado exitosamente.`);
                            // Actualizar la página
                            mostrarCasilleros();
                        } else {
                            alert('No puedes liberar un casillero que no reservaste.');
                        }
                    } else {
                        // Reservar el casillero
                        await reservarCasillero(zonaId, casillero.codigo, documentoUsuario);
                        alert(`Casillero ${casillero.codigo} reservado exitosamente.`);
                        // Actualizar la página
                        mostrarCasilleros();
                    }
                } else {
                    alert('El número de documento no coincide con el usuario que inició sesión.');
                }
            });

            gridCasilleros.appendChild(botonCasillero);
        });

        contenedorCasilleros.appendChild(gridCasilleros);
    } catch (error) {
        console.error('Error al mostrar los casilleros:', error);

        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Hubo un problema al mostrar los casilleros.";

        
        const contenedorCasilleros = document.getElementById("casilleros-container");
        contenedorCasilleros.innerHTML = '';
        contenedorCasilleros.appendChild(errorMessage);
    }
}

// Función para reservar un casillero
async function reservarCasillero(zonaId, casilleroCodigo, documentoUsuario) {
    try {
        // Obtener la zona completa
        const zona = await obtenerZona(zonaId);

        // Encontrar el casillero a actualizar
        const casillero = zona.casilleros.find(c => c.codigo === casilleroCodigo);

        if (casillero) {
            // Actualizar el casillero
            casillero.ocupado = true;
            casillero.usuario = documentoUsuario;
            casillero.fechaOcupacion = new Date().toISOString();

            // Añadir entrada al historial
            if (!casillero.historial) {
                casillero.historial = [];
            }
            casillero.historial.push({
                usuario: documentoUsuario,
                nombreUsuario: obtenerNombreUsuario(documentoUsuario),
                fechaIngreso: casillero.fechaOcupacion,
                fechaLiberacion: null
            });

            // Actualizar la zona en el servidor
            const response = await fetch(`${apiUrl}/zonas/${zonaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(zona)
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el casillero');
            }
        }
    } catch (error) {
        console.error('Error al reservar el casillero:', error);
        throw error;
    }
}

// Función para liberar un casillero
async function liberarCasillero(zonaId, casilleroCodigo) {
    try {
        // Obtener la zona completa
        const zona = await obtenerZona(zonaId);

        // Encontrar el casillero a actualizar
        const casillero = zona.casilleros.find(c => c.codigo === casilleroCodigo);

        if (casillero) {
            // Actualizar el casillero
            casillero.ocupado = false;
            casillero.usuario = "";
            const fechaLiberacion = new Date().toISOString();

            // Actualizar el historial
            if (casillero.historial && casillero.historial.length > 0) {
                // Encontrar la última entrada donde la fecha de liberación es null
                const ultimaEntrada = [...casillero.historial].reverse().find(entry => entry.fechaLiberacion === null);
                if (ultimaEntrada) {
                    ultimaEntrada.fechaLiberacion = fechaLiberacion;
                }
            }

            casillero.fechaOcupacion = "";

            // Actualizar la zona en el servidor
            const response = await fetch(`${apiUrl}/zonas/${zonaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(zona)
            });

            if (!response.ok) {
                throw new Error('Error al liberar el casillero');
            }
        }
    } catch (error) {
        console.error('Error al liberar el casillero:', error);
        throw error;
    }
}

// Función para verificar casilleros ocupados por más de 12 horas
async function verificarCasilleros() {
    const zonas = await obtenerZonas();

    const ahora = new Date();

    zonas.forEach(async zona => {
        let hayCambios = false;
        zona.casilleros.forEach(casillero => {
            if (casillero.ocupado && casillero.fechaOcupacion) {
                const fechaOcupacion = new Date(casillero.fechaOcupacion);
                const diferenciaHoras = (ahora - fechaOcupacion) / (1000 * 60 * 60);
                if (diferenciaHoras > 12 && !casillero.reportado) {
                    // Generar reporte
                    if (!casillero.reportes) {
                        casillero.reportes = [];
                    }
                    casillero.reportes.push({
                        fechaReporte: ahora.toISOString(),
                        motivo: 'Casillero ocupado por más de 12 horas',
                        usuario: casillero.usuario,
                        nombreUsuario: obtenerNombreUsuario(casillero.usuario)
                    });
                    // Marcar como reportado para no generar múltiples reportes
                    casillero.reportado = true;
                    hayCambios = true;
                }
            }
        });

        if (hayCambios) {
            // Actualizar la zona en el servidor
            const response = await fetch(`${apiUrl}/zonas/${zona.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(zona)
            });

            if (!response.ok) {
                console.error('Error al actualizar la zona:', response.statusText);
            }
        }
    });
} 

document.getElementById('cerrar-sesion').addEventListener('click', function() {
    window.location.href = 'index.html';
});

// Ejecutar la verificación cada hora
setInterval(verificarCasilleros, 60 * 60 * 1000);

// Ejecutar al cargar la página
verificarCasilleros();

// Llamar a la función para mostrar los casilleros cuando se carga la página
document.addEventListener('DOMContentLoaded', () =>{ 
    verificarAcceso();
    mostrarCasilleros();
});

document.getElementById('btnvolver').addEventListener('click', function() {
    window.location.href = 'zonas.html';
});

if (cerrarSesionButton) {
    cerrarSesionButton.addEventListener('click', function() {
        window.location.href = 'index.html';
        localStorage.removeItem('documentoUsuario');
        localStorage.removeItem('usuario');
        console.log("cerrando sesion");
    });
}

function verificarAcceso() {
    const documentoUsuario = localStorage.getItem('documentoUsuario');
    if (!documentoUsuario) {
        // Si no hay documento, redirigir al login
        window.location.href = 'index.html';
    }
}

