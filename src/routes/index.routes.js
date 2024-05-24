import { Router } from "express";
import pool from '../database.js';


const router = Router();

router.get('/', async (req, res) => {
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

export default router;