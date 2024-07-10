document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            console.log(`Usuario: ${username}, Contraseña: ${password}`);
            // Aquí agregarías la lógica para autenticar al usuario
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUsername = document.getElementById('newUsername').value;
            const newPassword = document.getElementById('newPassword').value;
            const email = document.getElementById('email').value;
            console.log(`Nuevo Usuario: ${newUsername}, Contraseña: ${newPassword}, Email: ${email}`);
            // Aquí agregarías la lógica para registrar al usuario
        });
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const resetEmail = document.getElementById('resetEmail').value;
            console.log(`Correo para restablecer: ${resetEmail}`);
            // Aquí agregarías la lógica para enviar el email de restablecimiento
        });
    }
});
