
// URL de nuestro servidor en la nube (Pronto la cambiaremos por la real de Render)
const URL_SERVIDOR = 'http://localhost:3000';// --- 1. SISTEMA DE SEGURIDAD ---
const token = localStorage.getItem('tokenCybereda');

// Si no hay token, lo mandamos al login inmediatamente
if (!token) {
    window.location.replace('login.html'); 
}

// --- 2. SELECTORES DEL DOM ---
const formProducto = document.getElementById('formProducto');
const tablaProductos = document.getElementById('tablaProductos');
const btnSalir = document.querySelector('.btn-salir');

// --- 3. EVENTOS ---
// Esperamos a que la página cargue para ejecutar esto
document.addEventListener('DOMContentLoaded', () => {
    obtenerProductosAdmin(); // Carga la tabla de SQLite

    // Evento para el botón de Cerrar Sesión
    if (btnSalir) {
        btnSalir.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que salte a otra parte
            localStorage.removeItem('tokenCybereda'); // Destruye la llave
            window.location.replace('login.html'); // Redirige al login
        });
    }
});

// Eventos del formulario y la tabla
if (formProducto) formProducto.addEventListener('submit', guardarProducto);
if (tablaProductos) tablaProductos.addEventListener('click', manejarClicTabla);


// --- 4. FUNCIONES ---
async function obtenerProductosAdmin() {
    try {
        const respuesta = await fetch(`${URL_SERVIDOR}/api/productos`);
        const productos = await respuesta.json();
        
        if (tablaProductos) tablaProductos.innerHTML = '';
        
        productos.forEach(producto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${producto.id}</td>
                <td><img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: contain;"></td>
                <td><strong>${producto.nombre}</strong></td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td><span style="background:#eee; padding:5px 10px; border-radius:15px; font-size:0.8rem;">${producto.categoria}</span></td>
                <td>
                    <button class="btn-eliminar" data-id="${producto.id}" style="color: red; cursor: pointer; border: none; background: none; font-size: 1.2rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            if (tablaProductos) tablaProductos.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar la tabla:', error);
    }
}

async function guardarProducto(e) {
    e.preventDefault();
    const nuevoProducto = {
        nombre: document.getElementById('nombre').value,
        precio: parseFloat(document.getElementById('precio').value),
        imagen: document.getElementById('imagen').value,
        categoria: document.getElementById('categoria').value
    };

    try {
        const respuesta = await fetch('http://localhost:3000/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });

        if (respuesta.ok) {
            alert('¡Producto guardado con éxito!');
            formProducto.reset();
            obtenerProductosAdmin();
        } else {
            alert('Hubo un error al guardar el producto.');
        }
    } catch (error) {
        console.error('Error al guardar:', error);
    }
}

function manejarClicTabla(e) {
    const botonEliminar = e.target.closest('.btn-eliminar');
    if (botonEliminar) {
        const idProducto = botonEliminar.getAttribute('data-id');
        const confirmar = confirm(`¿Estás seguro de que deseas eliminar el producto #${idProducto}?`);
        if (confirmar) {
            eliminarProductoAdmin(idProducto);
        }
    }
}

async function eliminarProductoAdmin(id) {
    try {
        const respuesta = await fetch(`http://localhost:3000/api/productos/${id}`, {
            method: 'DELETE'
        });
        if (respuesta.ok) {
            alert('Producto eliminado correctamente.');
            obtenerProductosAdmin(); 
        } else {
            alert('Hubo un problema al intentar eliminar el producto.');
        }
    } catch (error) {
        console.error('Error al intentar eliminar:', error);
    }
}