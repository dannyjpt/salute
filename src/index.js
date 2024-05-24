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
    const query = `
      SELECT p.id, p.nombre, p.categoría, p.precio, p.cantidad, DATE_FORMAT(p.fechav, "%Y-%m-%d") AS fechav 
      FROM productos p
      LEFT JOIN notificaciones n ON p.id = n.id_producto AND p.fechav = n.fechav
      WHERE p.fechav BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND (n.id_producto IS NULL OR n.estado = 'activo')
    `;
  
    try {
      const [productosVencidos] = await pool.query(query);
      
  
      if (productosVencidos.length > 0) {
        const insertQuery = `
          INSERT INTO notificaciones (id_producto, fechav, estado) 
          VALUES (?, ?, 'activo')
          ON DUPLICATE KEY UPDATE estado = 'activo'
        `;
  
        for (const producto of productosVencidos) {
          await pool.query(insertQuery, [producto.id, producto.fechav]);
        }
      }
  
      // Filtramos los productos para excluir aquellos con notificaciones inactivas
      const filteredProductosVencidos = productosVencidos.filter(producto => !producto.id_notificacion || producto.estado === 'activo');
      console.log(filteredProductosVencidos);
      res.json(filteredProductosVencidos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al consultar productos vencidos' });
    }
  });
  

  // Ruta para actualizar el estado de la notificación
app.put('/api/notificacion/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    console.log(estado);
    console.log(id);
    try {
        const query = 'UPDATE notificaciones SET estado = ? WHERE id_producto = ?';
        await pool.query(query, [estado, id]);

        res.status(200).json({ message: 'Notificación actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar la notificación:', error);
        res.status(500).json({ error: 'Error al actualizar la notificación' });
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


