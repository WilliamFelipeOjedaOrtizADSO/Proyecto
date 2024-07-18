const documento = document.getElementById("Documento");
const tipodoc = document.getElementById("TipoDocumento")
const nombre = document.getElementById("nombre");
const password = document.getElementById("password");
const form = document.getElementById("formulario-registro");
const parrafo = document.getElementById("warnings");

// Validar formulario register----------------------------------------------------------

form.addEventListener("submit", e => {
    e.preventDefault();
    let warnings = "";
    let entrar = false;
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
    parrafo.innerHTML = "";
    
    if (documento.value.length > 12 || documento.value.length == "") {
        warnings += `El documento no es válido <br>`;
        entrar = true;
    }

    if (nombre.value.length > 25 || nombre.value.length == "") {
        warnings += `El nombre no es válido <br>`;
        entrar = true;
    }

    if (tipodoc.value == "") {
        warnings += `Por favor escoge un tipo de documento<br>`
        entrar = true
    }
    if (password.value.length < 8 || password.value.length == "") {
        warnings += `La contraseña no es válida <br>`;
        entrar = true;
    }
})