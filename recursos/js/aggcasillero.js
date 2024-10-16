import { apiUrl } from './config.js';

// Obtener las zonas desde el servidor y llenar el combobox
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
    }
}

// Llenar el combobox con las zonas
async function llenarComboboxZonas() {
    const zonas = await obtenerZonas();
    const zonaSelect = document.getElementById('zona-select');
    
    zonas.forEach(zona => {
        const option = document.createElement('option');
        option.value = zona.id; // Usamos el ID de la zona como valor
        option.textContent = zona.nombre; // Mostramos el nombre de la zona
        zonaSelect.appendChild(option);
    });
}

// Función para mostrar los casilleros existentes en la tabla
async function mostrarCasilleros() {
    const zonas = await obtenerZonas();
    const tablaBody = document.querySelector('#tabla-casilleros tbody');
    tablaBody.innerHTML = ''; // Limpiar contenido previo

    // Obtener valores de los filtros
    const filtroZona = document.getElementById('filtro-zona').value;
    const filtroCodigo = document.getElementById('filtro-codigo').value.trim().toLowerCase();
    const filtroEstado = document.getElementById('filtro-estado').value;

    zonas.forEach(zona => {
        zona.casilleros.forEach(casillero => {
            // Aplicar filtros
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
                const fila = document.createElement('tr');

                // Columna Código
                const celdaCodigo = document.createElement('td');
                celdaCodigo.textContent = casillero.codigo;
                fila.appendChild(celdaCodigo);

                // Columna Zona
                const celdaZona = document.createElement('td');
                celdaZona.textContent = zona.nombre;
                fila.appendChild(celdaZona);

                // Columna Estado
                const celdaEstado = document.createElement('td');
                celdaEstado.textContent = casillero.ocupado ? 'Ocupado' : 'Disponible';
                fila.appendChild(celdaEstado);

                // Columna Acciones
                const celdaAcciones = document.createElement('td');

                // Botón Editar
                const botonEditar = document.createElement('button');
                botonEditar.textContent = 'Editar';
                botonEditar.addEventListener('click', () => editarCasillero(zona.id, casillero.codigo));
                celdaAcciones.appendChild(botonEditar);

                // Botón Eliminar
                const botonEliminar = document.createElement('button');
                botonEliminar.textContent = 'Eliminar';
                botonEliminar.addEventListener('click', () => eliminarCasillero(zona.id, casillero.codigo));
                celdaAcciones.appendChild(botonEliminar);

                fila.appendChild(celdaAcciones);

                tablaBody.appendChild(fila);
            }
        });
    });
}

// Función para cargar las zonas en el filtro de zonas
async function cargarZonasEnFiltro() {
    const zonas = await obtenerZonas();
    const filtroZonaSelect = document.getElementById('filtro-zona');

    zonas.forEach(zona => {
        const option = document.createElement('option');
        option.value = zona.id;
        option.textContent = zona.nombre;
        filtroZonaSelect.appendChild(option);
    });
}

// Event listener para el botón de filtrar
document.getElementById('filtrar-btn').addEventListener('click', mostrarCasilleros);

// Modificar la inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await llenarComboboxZonas();
    await cargarZonasEnFiltro();
    await mostrarCasilleros();
});

// Función para editar un casillero
async function editarCasillero(zonaId, codigoCasillero) {
    const nuevoCodigo = prompt('Ingrese el nuevo código para el casillero:', codigoCasillero);
    if (!nuevoCodigo || nuevoCodigo.trim() === '') {
        alert('El código no puede estar vacío.');
        return;
    }

    try {
        // Obtener la zona específica
        const response = await fetch(`${apiUrl}/zonas/${zonaId}`);
        const zona = await response.json();

        // Encontrar el casillero a editar
        const casillero = zona.casilleros.find(c => c.codigo === codigoCasillero);
        if (!casillero) throw new Error('Casillero no encontrado');

        // Verificar si el nuevo código ya existe en la zona
        const codigoExistente = zona.casilleros.some(c => c.codigo === nuevoCodigo && c.codigo !== codigoCasillero);
        if (codigoExistente) {
            alert('Ya existe un casillero con ese código en esta zona.');
            return;
        }

        // Actualizar el código del casillero
        casillero.codigo = nuevoCodigo;

        // Actualizar la zona en el servidor
        await fetch(`${apiUrl}/zonas/${zonaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(zona),
        });

        alert('Casillero actualizado exitosamente.');
        mostrarCasilleros();

    } catch (error) {
        console.error('Error al editar el casillero:', error);
        alert('Hubo un error al editar el casillero.');
    }
}

// Función para eliminar un casillero
async function eliminarCasillero(zonaId, codigoCasillero) {
    if (!confirm('¿Estás seguro de eliminar este casillero?')) {
        return;
    }

    try {
        // Obtener la zona específica
        const response = await fetch(`${apiUrl}/zonas/${zonaId}`);
        const zona = await response.json();

        // Filtrar los casilleros para eliminar el seleccionado
        zona.casilleros = zona.casilleros.filter(c => c.codigo !== codigoCasillero);

        // Actualizar la zona en el servidor
        await fetch(`${apiUrl}/zonas/${zonaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(zona),
        });

        alert('Casillero eliminado exitosamente.');
        mostrarCasilleros();

    } catch (error) {
        console.error('Error al eliminar el casillero:', error);
        alert('Hubo un error al eliminar el casillero.');
    }
}

// Función para agregar casilleros a la zona seleccionada
async function agregarCasilleros(event) {
    event.preventDefault();

    const zonaId = document.getElementById('zona-select').value;
    const cantidadCasilleros = parseInt(document.getElementById('cantidad-casilleros').value, 10);

    if (!zonaId || isNaN(cantidadCasilleros) || cantidadCasilleros <= 0) {
        document.getElementById('mensaje').textContent = 'Por favor selecciona una zona y una cantidad válida de casilleros.';
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/zonas/${zonaId}`);
        const zonaSeleccionada = await response.json();
        if (!zonaSeleccionada) throw new Error('Zona no encontrada');

        // Generamos los nuevos casilleros para la zona
        const nuevosCasilleros = [];
        for (let i = 1; i <= cantidadCasilleros; i++) {
            const nuevoCodigo = `${zonaId}${zonaSeleccionada.casilleros.length + i}`;
            nuevosCasilleros.push({
                codigo: nuevoCodigo,
                ocupado: false,
                usuario: "",
                fechaOcupacion: "",
                historial: [],
                reportes: [],
                reportado: false
            });
        }

        // Añadimos los nuevos casilleros al array de la zona
        zonaSeleccionada.casilleros.push(...nuevosCasilleros);

        // Guardamos los cambios en el servidor
        await fetch(`${apiUrl}/zonas/${zonaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(zonaSeleccionada),
        });

        document.getElementById('mensaje').textContent = `Se han agregado ${cantidadCasilleros} casilleros a la zona ${zonaSeleccionada.nombre}.`;
        document.getElementById('agregarCasillerosForm').reset(); // Limpiamos el formulario

        // Actualizar la lista de casilleros
        mostrarCasilleros();

    } catch (error) {
        console.error('Error al agregar los casilleros:', error);
        document.getElementById('mensaje').textContent = 'Hubo un error al agregar los casilleros.';
    }
}

// Event listener para el formulario
document.getElementById('agregarCasillerosForm').addEventListener('submit', agregarCasilleros);

// Llenar el combobox con las zonas y mostrar casilleros cuando se carga la página
document.addEventListener('DOMContentLoaded', async () => {
    await llenarComboboxZonas();
    await mostrarCasilleros();
});
