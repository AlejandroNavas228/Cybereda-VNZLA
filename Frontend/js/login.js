// URL de nuestro servidor en la nube (Pronto la cambiaremos por la real de Render)
const URL_SERVIDOR = 'http://localhost:3000';

const formLogin = document.getElementById('formLogin');
const mensajeError = document.getElementById('mensajeError');

// Si ya tiene la llave guardada, lo mandamos directo al panel admin para que no inicie sesión de nuevo
if (localStorage.getItem('tokenCybereda')) {
    window.location.href = 'admin.html';
}

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        const respuesta = await fetch(`${URL_SERVIDOR}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const datos = await respuesta.json();

        if (respuesta.ok && datos.exito) {
            // ¡Login exitoso! Guardamos la "llave" en su local storage
            localStorage.setItem('tokenCybereda', datos.token);
            // Lo redirigimos al panel
            window.location.href = 'admin.html';
        } else {
            // Mostramos el mensaje de error
            mensajeError.style.display = 'block';
            mensajeError.textContent = datos.mensaje;
        }
    } catch (error) {
        console.error('Error en la petición:', error);
        mensajeError.style.display = 'block';
        mensajeError.textContent = 'Error al conectar con el servidor.';
    }
});