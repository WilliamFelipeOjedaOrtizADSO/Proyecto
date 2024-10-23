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
            const response = await fetch(`${apiUrl}/users`);
            const data = await response.json();

            let usuario = data.find(user => 
                user.tipoDocumento === tipoDocumento &&
                user.documento === documento &&
                user.contrasena === contrasena
            );

            if (usuario) {
                localStorage.setItem('usuario', JSON.stringify(usuario));
                localStorage.setItem('documentoUsuario', usuario.documento);

                if (usuario.roleId === 2) {
                    window.location.href = 'menu.html';
                } else if (usuario.roleId === 1) {
                    window.location.href = 'zonas.html';
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
