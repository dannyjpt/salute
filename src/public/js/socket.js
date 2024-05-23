// public/js/alertaVencimiento.js
document.addEventListener('DOMContentLoaded', () => {
    var alert = document.getElementById("alertc");
    var message = document.getElementById("messagec");
    const checkForExpiringProducts = async () => {
        try {
            const response = await fetch('/api/vencimiento-alerta');
            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
            }
            const productos = await response.json();

            if (productos.length > 0) {
                console.log(`Hay ${productos.length} productos próximos a vencer en la próxima semana.`);
                alert.textContent = productos.length;
                message.textContent = `El producto ${productos[0].nombre} vencera el ${productos[0].fechav}`;
            }
        } catch (error) {
            console.error('Error al verificar productos próximos a vencer:', error);
        }
    };

    // Verificar cada minuto
    setInterval(checkForExpiringProducts, 5000);
});
