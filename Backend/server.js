const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Permisos para que el Frontend (HTML) se comunique con el Backend
app.use(cors());
app.use(express.json());

// 1. CONEXIÓN A LA BASE DE DATOS (Crea el archivo database.sqlite automáticamente)
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos SQLite.');
        crearTablaEInsertarDatos();
    }
});

// 2. CREAR TABLA E INSERTAR PRODUCTOS DE PRUEBA
function crearTablaEInsertarDatos() {
    db.run(`CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        precio REAL,
        imagen TEXT,
        categoria TEXT
    )`, () => {
        // Verificamos si ya hay productos para no duplicarlos cada vez que encendemos el servidor
        db.get("SELECT COUNT(*) AS count FROM productos", (err, row) => {
            if (row.count === 0) {
                const insert = db.prepare(`INSERT INTO productos (nombre, precio, imagen, categoria) VALUES (?, ?, ?, ?)`);
                // Aquí metemos los datos iniciales
                insert.run("Audífonos Inalámbricos", 25.50, "https://i.ibb.co/39svk4t0/Whats-App-Image-2026-02-14-at-4-12-01-PM.jpg", "Audio");
                insert.run("Mini Teclado", 45.00, "https://i.ibb.co/N2XPFZw3/mini-teclado.jpg", "Relojes");
                insert.run("Corneta Bluethooth", 15.50, "https://i.ibb.co/Kj61RsZq/corneta.jpg", "Accesorios");
                insert.run("Mouse y Teclado Inalambricos", 18.00, "https://i.ibb.co/tpywrWPV/mouse.jpg", "Iluminación");
                insert.finalize();
                console.log("📦 Productos iniciales insertados en la base de datos.");
            }
        });
    });
}

// 3. RUTAS DEL SERVIDOR (API)
app.get('/', (req, res) => {
    res.send('Servidor de CYBEREDAVZLA funcionando');
});

// Ruta vital: El Frontend entrará aquí para pedir los productos
app.get('/api/productos', (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows); // Enviamos los productos al frontend en formato JSON
    });
});

// Ruta para RECIBIR y GUARDAR un nuevo producto en la Base de Datos
app.post('/api/productos', (req, res) => {
    // req.body contiene los datos que envió nuestro formulario
    const { nombre, precio, imagen, categoria } = req.body;

    // Preparamos la instrucción para SQLite
    const query = `INSERT INTO productos (nombre, precio, imagen, categoria) VALUES (?, ?, ?, ?)`;
    
    // Ejecutamos la inserción
    db.run(query, [nombre, precio, imagen, categoria], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Respondemos al Frontend que todo salió bien y le devolvemos el ID del nuevo producto
        res.status(201).json({ 
            mensaje: 'Producto creado exitosamente', 
            id: this.lastID 
        });
    });
});

// Ruta para ELIMINAR un producto de la Base de Datos
app.delete('/api/productos/:id', (req, res) => {
    // Capturamos el ID del producto que viene en la URL
    const idProducto = req.params.id;

    // Instrucción para SQLite: Borra el producto donde el ID coincida
    const query = `DELETE FROM productos WHERE id = ?`;
    
    db.run(query, [idProducto], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // this.changes nos dice cuántas filas fueron eliminadas
        if (this.changes === 0) {
            res.status(404).json({ mensaje: 'Producto no encontrado' });
            return;
        }
        
        // Si todo salió bien, respondemos con éxito
        res.json({ mensaje: 'Producto eliminado exitosamente' });
    });
});

// Ruta para el LOGIN del Administrador
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;

    // Credenciales de acceso para CYBEREDAVZLA
    const usuarioCorrecto = "admin";
    const passwordCorrecto = "cybereda2026"; // ¡Puedes cambiarla si quieres!

    if (usuario === usuarioCorrecto && password === passwordCorrecto) {
        // Si los datos coinciden, enviamos un "token" de éxito
        res.json({ exito: true, token: 'llave-secreta-admin-12345' });
    } else {
        // Si fallan, enviamos un error 401 (No autorizado)
        res.status(401).json({ exito: false, mensaje: 'Usuario o contraseña incorrectos' });
    }
});

// 4. ENCENDER EL SERVIDOR
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});