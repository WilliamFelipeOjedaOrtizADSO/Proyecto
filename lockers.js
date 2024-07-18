document.addEventListener('DOMContentLoaded', () => {
    const lockers = document.querySelectorAll('.locker');

    lockers.forEach(locker => {
        locker.addEventListener('click', () => {
            locker.classList.toggle('selected');
        });
    });

    // (Resto del código existente)
});
