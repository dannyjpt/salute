import express from 'express';
import { engine } from 'express-handlebars'
import morgan from 'morgan';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import productsRoutes from './routes/products.routes.js';
import pool from './database.js';
import http from 'http';
import { Server } from 'socket.io';

//Inicialización
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const __dirname = dirname(fileURLToPath(import.meta.url));

//Configuración
app.set('port', process.env.PORT || 3000);
app.set('views', join(__dirname, 'views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: join(app.get('views'), 'layouts'),
    partialsDir: join(app.get('views'), 'partials'),
    extname: '.hbs'
}));

app.set('view engine', '.hbs')

//Middels
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Ruta para obtener productos próximos a vencer
app.get('/api/vencimiento-alerta', async (req, res) => {
    try {
        const query = `
            SELECT id, nombre, categoría, precio, cantidad, DATE_FORMAT(fechav, "%d-%m-%Y") AS fechav FROM productos 
            WHERE fechav BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        `;
        const [results] = await pool.query(query);
        res.json(results);
        console.log(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Routes
app.get('/', async (req, res) => { 
    try { 
        const histogramQuery = ` 
            SELECT p.precio AS precio, 
                   DATE_FORMAT(fecha_salida, "%d-%m-%Y") AS fecha 
            FROM registro_salida rs 
            JOIN productos p ON rs.id_producto = p.id; 
        `; 
        const [histogramResult] = await pool.query(histogramQuery); 

        const pieChartQuery = ` 
            SELECT p.categoría AS categoria, 
                   SUM(rs.cantidad) AS cantidad_vendida 
            FROM registro_salida rs 
            JOIN productos p ON rs.id_producto = p.id 
            GROUP BY p.categoría 
            ORDER BY cantidad_vendida DESC 
            LIMIT 5; 
        `; 
        const [pieChartResult] = await pool.query(pieChartQuery); 

        // Renderiza la vista index y pasa los datos de los gráficos como cadenas JSON 
        res.render('partials/index', { 
            histogramData: JSON.stringify(histogramResult), 
            pieChartData: JSON.stringify(pieChartResult) 
        }); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    } 
});




app.use(productsRoutes);

//Public
app.use(express.static(join(__dirname, 'public')));

//Server
app.listen(app.get('port'), () =>
    console.log('Server on port ', app.get('port')));
console.log(app.get('views'))



/*/ Función para consultar la base de datos periódicamente y emitir los datos
setInterval(async () => {
    try {
        const query = `
            SELECT * FROM productos 
            WHERE fechav >= CURDATE() AND fechav <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        `;
        const [results] = await pool.query(query);
        io.emit('vencimiento_alerta', results);
        console.log(results);
    } catch (err) {
        console.error('Error al consultar la base de datos:', err.message);
    }
}, 10000); // Cada 1 minuto*/