const email = document.getElementById("email");
const form = document.getElementById("formulario-registro");
const parrafo = document.getElementById("warnings");

form.addEventListener("submit", e => {
    e.preventDefault();
    let warnings1 = "";
    let entrar = false;
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
    parrafo.innerHTML = "";

    document.getElementById("formulario-registro").addEventListener("submit", function(event) {
        let warnings = "";
        let entrar = false;

        // Validaciones...

        if (entrar) {
            event.preventDefault();  // Evita que el formulario se envíe
            document.getElementById("warnings").innerHTML = warnings;
        }

        if (!regexEmail.test(email.value)) {
            warnings += `El email no es válido <br>`;
            entrar = true;
        }


        if (entrar) {
            parrafo.innerHTML = warnings;
        }
    });

    });




//---------------------------------------------------------------------------------------