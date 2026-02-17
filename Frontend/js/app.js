// URL de nuestro servidor en la nube (Pronto la cambiaremos por la real de Render)
const URL_SERVIDOR = 'https://cybereda-vnzla.onrender.com';

let productos = []; 
let carrito = [];


const contenedorProductos = document.querySelector('.grid-productos');
const contadorCarrito = document.querySelector('.cart-count');
const btnAbrirCarrito = document.querySelector('.cart-icon');
const btnCerrarCarrito = document.querySelector('#cerrarCarrito');
const btnPagar = document.querySelector('#btnPagar'); 
const sidebarCarrito = document.querySelector('#carritoSidebar');
const overlayCarrito = document.querySelector('#overlayCarrito');
const contenedorCarritoItems = document.querySelector('#contenedorCarritoItems');
const precioTotal = document.querySelector('#precioTotal');
const btnVaciar = document.querySelector('#btnVaciar');

// EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    // 1. Primero pedimos los productos a NUESTRO servidor local
    obtenerProductosDelServidor();
    
    // 2. Cargamos el carrito guardado
    carrito = JSON.parse(localStorage.getItem('carritoCybereda')) || [];
    actualizarCarritoVisual();
});

// NUEVA FUNCIÓN: La magia de conectar con el Backend
async function obtenerProductosDelServidor() {
    try {
        // Hacemos la petición a la ruta que creamos en server.js
        const respuesta = await fetch(`${URL_SERVIDOR}/api/productos`);
        
        // Convertimos la respuesta del servidor a un formato que JavaScript entienda (JSON)
        const datosReales = await respuesta.json();
        
        // Guardamos esos datos en nuestra variable global
        productos = datosReales;
        
        // Ahora sí, ya con los datos en mano, dibujamos las tarjetas en la web
        renderizarProductos();
        
    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        contenedorProductos.innerHTML = '<h3 style="text-align:center; color:red;">Error al cargar los productos. Asegúrate de tener el servidor encendido.</h3>';
    }
}


contenedorProductos.addEventListener('click', agregarProducto);

// NUEVOS EVENTOS: Abrir, cerrar, eliminar y vaciar
btnAbrirCarrito.addEventListener('click', (e) => {
    e.preventDefault(); // Evita que la página salte hacia arriba
    sidebarCarrito.classList.add('activo');
    overlayCarrito.classList.add('activo');
});

btnCerrarCarrito.addEventListener('click', cerrarPanel);
overlayCarrito.addEventListener('click', cerrarPanel);

contenedorCarritoItems.addEventListener('click', eliminarProducto);

btnVaciar.addEventListener('click', () => {
    carrito = []; // Vaciamos el arreglo
    actualizarCarritoVisual();
});

btnPagar.addEventListener('click', enviarPedidoWhatsApp);

// --- FUNCIONALIDAD DEL BUSCADOR ---
const inputBuscador = document.querySelector('.search-bar input');

inputBuscador.addEventListener('input', (e) => {
    const textoBuscado = e.target.value.toLowerCase(); // Lo que escribe el cliente en minúsculas
    
    // Filtramos el arreglo de productos
    const productosFiltrados = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(textoBuscado) || 
        producto.categoria.toLowerCase().includes(textoBuscado)
    );
    
    // Dibujamos solo los que coincidan
    renderizarProductos(productosFiltrados);
});

// FUNCIONES
function cerrarPanel() {
    sidebarCarrito.classList.remove('activo');
    overlayCarrito.classList.remove('activo');
}

// OJO: Le agregamos "listaProductos = productos" entre los paréntesis
function renderizarProductos(listaProductos = productos) {
    contenedorProductos.innerHTML = ''; // Limpiamos el contenedor antes de dibujar

    listaProductos.forEach(producto => {
        const card = document.createElement('div');
        card.classList.add('producto-card');
        card.innerHTML = `
            <div class="producto-img-container">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            </div>
            <div class="producto-info">
                <span class="producto-categoria">${producto.categoria}</span>
                <h3 class="producto-titulo">${producto.nombre}</h3>
                <p class="producto-precio">$${producto.precio.toFixed(2)}</p>
                <button class="btn-agregar agregar-carrito" data-id="${producto.id}">
                    <i class="fas fa-cart-plus"></i> Agregar al Carrito
                </button>
            </div>
        `;
        contenedorProductos.appendChild(card);
    });
}

function agregarProducto(e) {
    const boton = e.target.closest('.agregar-carrito');
    if (boton) {
        const idProducto = parseInt(boton.getAttribute('data-id'));
        const productoSeleccionado = productos.find(producto => producto.id === idProducto);
        leerDatosProducto(productoSeleccionado);
        
        // Opcional: Abrir el carrito automáticamente al agregar un producto
        sidebarCarrito.classList.add('activo');
        overlayCarrito.classList.add('activo');
    }
}

function leerDatosProducto(producto) {
    const existe = carrito.some(articulo => articulo.id === producto.id);
    if (existe) {
        const carritoActualizado = carrito.map(articulo => {
            if (articulo.id === producto.id) {
                articulo.cantidad++;
                return articulo;
            } else {
                return articulo;
            }
        });
        carrito = [...carritoActualizado];
    } else {
        const infoProducto = {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        };
        carrito = [...carrito, infoProducto];
    }
    actualizarCarritoVisual();
}

function eliminarProducto(e) {
    const botonEliminar = e.target.closest('.borrar-producto');
    if (botonEliminar) {
        const idProducto = parseInt(botonEliminar.getAttribute('data-id'));
        // Filtramos el carrito para dejar todos MENOS el que estamos eliminando
        carrito = carrito.filter(articulo => articulo.id !== idProducto);
        actualizarCarritoVisual();
    }
}

// ESTA FUNCIÓN AHORA HACE TODO LO VISUAL
function actualizarCarritoVisual() {
    // 1. Limpiamos el HTML previo del panel para no duplicar info
    contenedorCarritoItems.innerHTML = '';
    
    let total = 0;
    let totalArticulos = 0;

    // 2. Dibujamos cada producto del arreglo en el panel
    carrito.forEach(articulo => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src="${articulo.imagen}" alt="${articulo.nombre}">
            <div class="cart-item-info">
                <h4>${articulo.nombre}</h4>
                <p class="cart-item-precio">$${articulo.precio.toFixed(2)}</p>
                <p class="cart-item-cantidad">Cant: ${articulo.cantidad}</p>
            </div>
            <button class="btn-eliminar borrar-producto" data-id="${articulo.id}">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        contenedorCarritoItems.appendChild(div);

        // Sumamos al total de dinero y cantidad de artículos
        total += articulo.precio * articulo.cantidad;
        totalArticulos += articulo.cantidad;
    });

    // 3. Actualizamos el HTML de los totales y el circulito rojo
    precioTotal.textContent = `$${total.toFixed(2)}`;
    contadorCarrito.textContent = totalArticulos;

    // 4. Guardamos los cambios en el navegador
    sincronizarStorage();
}

function sincronizarStorage() {
    localStorage.setItem('carritoCybereda', JSON.stringify(carrito));
}

// --- NUEVA FUNCIÓN PARA ENVIAR EL PEDIDO A WHATSAPP ---
function enviarPedidoWhatsApp() {
    // 1. Verificamos que el carrito no esté vacío
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. ¡Agrega algunos productos primero!');
        return;
    }

    // 2. Número de teléfono de la tienda (¡Cámbialo por el real!)
    const telefonoVendedor = "584242266955"; 
    
    // 3. Empezamos a redactar el mensaje
    let mensaje = "¡Hola CYBEREDAVZLA! 🚀 Quiero realizar el siguiente pedido:\n\n";
    let totalPedido = 0;

    // 4. Recorremos el carrito para listar cada producto
    carrito.forEach(articulo => {
        const subtotal = articulo.precio * articulo.cantidad;
        mensaje += `▪️ ${articulo.cantidad}x ${articulo.nombre} - $${subtotal.toFixed(2)}\n`;
        totalPedido += subtotal;
    });

    // 5. Añadimos el total y una despedida
    mensaje += `\n💰 *Total a pagar: $${totalPedido.toFixed(2)}*`;
    mensaje += `\n\n¿Me indicas los métodos de pago disponibles?`;

    // 6. Codificamos el texto para que los espacios y saltos de línea funcionen en la URL
    const urlWhatsApp = `https://wa.me/${telefonoVendedor}?text=${encodeURIComponent(mensaje)}`;
    
    // 7. Abrimos WhatsApp en una nueva pestaña
    window.open(urlWhatsApp, '_blank');
}