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

export default router;