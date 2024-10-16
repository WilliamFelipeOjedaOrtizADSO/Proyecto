import { apiUrl } from './config.js'; // Importamos la URL base desde el config.js

// Función para crear un mensaje sin usar innerHTML
function mostrarMensaje(tipo, mensaje) {
    const warningsElement = document.getElementById("warnings");
    warningsElement.textContent = ''; // Limpiamos el contenido anterior

    const texto = document.createTextNode(mensaje); // Creamos el nodo de texto
    warningsElement.appendChild(texto); // Añadimos el mensaje

    // Estilo para error o éxito
    warningsElement.style.color = tipo === "error" ? "red" : "green";
}

// Manejador para el envío del formulario de login
document.getElementById("formulario-login").addEventListener("submit", async function(event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario

    let warnings = "";
    let entrar = false;

    // Obtener valores de los campos del formulario
    let tipoDocumento = document.getElementById("TipoDocumento").value;
    let documento = document.getElementById("Documento").value;
    let contrasena = document.getElementById("password").value;

    // Validaciones
    if (tipoDocumento === "") {
        warnings += "Seleccione un tipo de documento.\n";
        entrar = true;
    }

    if (documento.length < 6) {
        warnings += "El número de documento es demasiado corto.\n";
        entrar = true;
    }

    if (contrasena.length < 8) {
        warnings += "La contraseña debe tener al menos 8 caracteres.\n";
        entrar = true;
    }

    // Mostrar advertencias si hay errores
    if (entrar) {
        mostrarMensaje("error", warnings);
    } else {
        try {
            // Consulta al servidor para verificar el usuario
            const response = await fetch(`${apiUrl}/users`);
            const data = await response.json();

            // Verificar si existe un usuario con las credenciales proporcionadas
            let usuario = data.find(user => 
                user.tipoDocumento === tipoDocumento &&
                user.documento === documento &&
                user.contrasena === contrasena
            );

            if (usuario) {
                // Guardar usuario en localStorage
                localStorage.setItem('usuario', JSON.stringify(usuario));

                // Guardar el número de documento del usuario en localStorage
                localStorage.setItem('documentoUsuario', usuario.documento);

                // Redirigir según el roleId del usuario
                if (usuario.roleId === 2) {
                    window.location.href = 'menu.html'; // Redirigir a la vista de administrador
                } else if (usuario.roleId === 1) {
                    window.location.href = 'zonas.html'; // Redirigir a la vista de usuario
                }
            } else {
                mostrarMensaje("error", "Documento, tipo o contraseña incorrectos.");
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje("error", "Hubo un problema al procesar la solicitud.");
        }
    }
});
