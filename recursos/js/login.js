import { apiUrl } from './config.js';

function mostrarMensaje(tipo, mensaje) {
    const warningsElement = document.getElementById("warnings");
    warningsElement.textContent = ''; 
    const texto = document.createTextNode(mensaje); 
    warningsElement.appendChild(texto); 
    warningsElement.style.color = tipo === "error" ? "red" : "green";
}

document.getElementById("login__formulario").addEventListener("submit", async function(event) {
    event.preventDefault();

    let warnings = "";
    let entrar = false;

    let tipoDocumento = document.getElementById("TipoDocumento").value;
    let documento = document.getElementById("Documento").value;
    let contrasena = document.getElementById("password").value;

    // Validaciones básicas del formulario
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

    if (entrar) {
        mostrarMensaje("error", warnings);
    } else {
        try {
            // Llamada al servidor para obtener usuarios
            const response = await fetch(`${apiUrl}/users`);
            if (!response.ok) {
                throw new Error('Error en la solicitud al servidor');
            }
            const data = await response.json();

            // Buscar al usuario por tipo de documento, documento y contraseña
            let usuario = data.find(user => 
                user.tipoDocumento === tipoDocumento &&
                user.documento === documento &&
                user.contrasena === contrasena
            );

            if (usuario) {
                // Guardar usuario en sessionStorage (solo durante la sesión)
                sessionStorage.setItem('usuario', JSON.stringify(usuario));
                sessionStorage.setItem('documentoUsuario', usuario.documento);

                // Redirección según el roleId del usuario
                if (usuario.roleId === 2) {
                    window.location.href = 'menu.html'; // Rol administrador
                } else if (usuario.roleId === 1) {
                    window.location.href = 'zonas.html'; // Rol usuario común
                } else {
                    mostrarMensaje("error", "No tiene permiso para acceder a esta sección.");
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
