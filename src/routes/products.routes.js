import { Router } from "express";
import pool from '../database.js';

const router = Router();

/*router.get('/products', async(req,res)=>{
    try{
        const [result] = await pool.query('SELECT * FROM productos');
        res.render('partials/products', {productos: result});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
})*/
router.get('/registrar', async(req,res)=>{
    
        res.render('partials/registrar');
    
});

router.get('/products', async (req, res) => {
    try {
        let query = 'SELECT id, nombre, categoría, precio, cantidad, DATE_FORMAT(fechav, "%d-%m-%Y") AS fechav FROM productos';
        let queryParams = [];

        // Verificar si se proporcionaron filtros
        const { cantidad, fecha, precio, categoria } = req.query;

        // Construir la consulta SQL según los filtros proporcionados
        if (categoria && categoria !== 'Seleccione') {
            query += ` WHERE categoría = ?`;
            queryParams.push(categoria);
        }

        // Agregar la cláusula ORDER BY según los filtros proporcionados
        if (cantidad && cantidad !== 'Seleccione') {
            query += ` ORDER BY cantidad ${cantidad === 'Mayor' ? 'DESC' : 'ASC'}`;
        } else if (fecha && fecha !== 'Seleccione') {
            query += ` ORDER BY fechav ${fecha === 'Reciente' ? 'DESC' : 'ASC'}`;
        } else if (precio && precio !== 'Seleccione') {
            query += ` ORDER BY precio ${precio === 'Mayor' ? 'DESC' : 'ASC'}`;
        }

        console.log(query);

        const [result] = await pool.query(query, queryParams);
        res.render('partials/products', { productos: result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/api/producto', async (req, res) => {
    const { nombre, categoria, precio, cantidad, fechav } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Insertar el producto en la tabla productos
        const insertProductoQuery = `
            INSERT INTO productos (nombre, categoría, precio, cantidad, fechav) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(insertProductoQuery, [nombre, categoria, precio, cantidad, fechav]);

        // Obtener el ID del producto insertado
        const productoId = result.insertId;

        // Insertar en la tabla registro_entrada
        const insertRegistroEntradaQuery = `
            INSERT INTO registro_entrada (id_producto, cantidad, fecha_entrada) 
            VALUES (?, ?, NOW())
        `;
        await connection.query(insertRegistroEntradaQuery, [productoId, cantidad]);

        // Verificar si la fecha de vencimiento está dentro de los próximos 7 días
        const now = new Date();
        const expiringDate = new Date(now);
        expiringDate.setDate(now.getDate() + 7);

        if (new Date(fechav) <= expiringDate) {
            // Insertar la notificación en la tabla notificaciones
            const insertNotificacionQuery = `
                INSERT INTO notificaciones (id_producto, estado, fechav) 
                VALUES (?, 'activo', ?)
            `;
            await connection.query(insertNotificacionQuery, [productoId, fechav]);
        }

        await connection.commit();
        res.render('partials/registrar', { message: 'Producto registrado con éxito' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al registrar el producto:', error);
        res.status(500).json({ error: 'Error al registrar el producto' });
    } finally {
        connection.release();
    }
});


export default router;