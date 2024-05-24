import { Router } from "express";
import pool from '../database.js';

const router = Router();

router.get('/api/vencimiento-alerta', async (req, res) => {
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
router.put('/api/notificacion/:id', async (req, res) => {
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


export default router;