// Importar la URL base desde el archivo de configuración
import { apiUrl } from './config.js'; // Asegúrate de que la ruta sea correcta

// Bloquea números en el campo de nombre
document.getElementById("nombre").addEventListener("input", function(event) {
    this.value = this.value.replace(/[0-9]/g, ''); // Reemplaza números por una cadena vacía
});

// Bloquea letras en los campos de documento, ficha y teléfono
document.getElementById("nuevoDocumento").addEventListener("input", function(event) {
    this.value = this.value.replace(/[a-zA-Z]/g, ''); // Reemplaza letras por una cadena vacía
});

document.getElementById("ficha").addEventListener("input", function(event) {
    this.value = this.value.replace(/[a-zA-Z]/g, ''); // Reemplaza letras por una cadena vacía
});

document.getElementById("telefono").addEventListener("input", function(event) {
    this.value = this.value.replace(/[a-zA-Z]/g, ''); // Reemplaza letras por una cadena vacía
});

// Función para crear un mensaje de advertencia o éxito sin usar innerHTML
function crearMensaje(tipo, mensaje) {
    const warningsElement = document.getElementById("warnings");

    // Limpiar el contenido previo
    warningsElement.textContent = ''; 

    // Crear el nodo de texto para el mensaje
    const mensajeTexto = document.createTextNode(mensaje || ''); // Asegurarse de que 'mensaje' no sea undefined

    // Insertar el texto en el contenedor
    warningsElement.appendChild(mensajeTexto);

    // Aplicar estilo según el tipo de mensaje
    if (tipo === "error") {
        warningsElement.style.color = "red";
    } else if (tipo === "exito") {
        warningsElement.style.color = "green";
    }
}

// Función para verificar si el documento o el correo ya existen
async function verificarUnicidad(documento, email) {
    try {
        const response = await fetch(`${apiUrl}/users`);
        const users = await response.json();
        const documentoExiste = users.some(user => user.documento === documento);
        const emailExiste = users.some(user => user.email === email);

        return { documentoExiste, emailExiste };
    } catch (error) {
        console.error("Error al verificar la unicidad:", error);
        return { documentoExiste: false, emailExiste: false };
    }
}

// Manejador para interceptar el envío del formulario
document.getElementById("formulario-registro").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    let warnings = "";
    let entrar = false;

    // Obtener los valores del formulario
    let tipoDocumento = document.getElementById("TipoDocumento").value;
    let documento = document.getElementById("nuevoDocumento").value;
    let nombre = document.getElementById("nombre").value;
    let contrasena = document.getElementById("nuevaContrasena").value;
    let ficha = document.getElementById("ficha").value;
    let telefono = document.getElementById("telefono").value;
    let email = document.getElementById("email").value;

    // Expresión regular para validar el formato del correo electrónico
    let regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    // Validar tipo de documento
    if (tipoDocumento === "") {
        warnings += "Seleccione un tipo de documento.\n";
        entrar = true;
    }

    // Validar documento (mínimo 6 caracteres)
    if (documento.length < 6) {
        warnings += "El documento debe contener al menos 6 caracteres.\n";
        entrar = true;
    }

    // Validar nombre (mínimo 3 caracteres)
    if (nombre.length < 3) {
        warnings += "El nombre debe contener al menos 3 caracteres.\n";
        entrar = true;
    }

    // Validar contraseña (mínimo 8 caracteres)
    if (contrasena.length < 8) {
        warnings += "La contraseña debe tener al menos 8 caracteres.\n";
        entrar = true;
    }

    // Validar ficha (no vacío)
    if (ficha === "") {
        warnings += "La ficha es obligatoria.\n";
        entrar = true;
    }

    // Validar teléfono (mínimo 7 caracteres)
    if (telefono.length < 7) {
        warnings += "El número de teléfono es demasiado corto.\n";
        entrar = true;
    }

    // Validar email (debe coincidir con la expresión regular)
    if (!regexEmail.test(email)) {
        warnings += "El correo electrónico no es válido.\n";
        entrar = true;
    }

    // Verificar la unicidad de documento y correo
    const { documentoExiste, emailExiste } = await verificarUnicidad(documento, email);
    if (documentoExiste) {
        warnings += "El documento ya está registrado.\n";
        entrar = true;
    }
    if (emailExiste) {
        warnings += "El correo electrónico ya está registrado.\n";
        entrar = true;
    }

    // Si hay errores, muestra las advertencias
    if (entrar) {
        crearMensaje("error", warnings); // Crear mensaje de advertencia
    } else {
        // Enviar los datos del formulario al servidor
        let formData = {
            tipoDocumento: tipoDocumento,
            documento: documento,
            nombre: nombre,
            contrasena: contrasena,
            ficha: ficha,
            telefono: telefono,
            email: email,
            roleId: 1
        };

        try {
            const response = await fetch(`${apiUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Mostrar mensaje de éxito
                crearMensaje("exito", "Su registro se ha completado exitosamente.");

                // Limpiar el formulario
                document.getElementById("formulario-registro").reset();

                // Esperar unos segundos antes de redirigir
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redirige a la página de login
                }, 3000); // Esperar 3 segundos antes de redirigir
            } else {
                // Si no hay un mensaje adecuado, evitar que aparezca undefined
                crearMensaje("error", data.message || "Su registro se ha completado exitosamente.");
            }
        } catch (error) {
            console.error('Error:', error);
            crearMensaje("error", "Hubo un problema al procesar la solicitud.");
        }
    }
});

// Manejador para habilitar/deshabilitar el botón de envío según el estado del checkbox de términos
document.getElementById("terminos").addEventListener("change", function() {
    const isChecked = this.checked;
    const submitButton = document.getElementById("submit-btn");
    submitButton.disabled = !isChecked;
});
