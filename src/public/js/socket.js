document.addEventListener('DOMContentLoaded', () => {
    var alert = document.getElementById("alertc");
    var alertsContainer = document.getElementById("alertsContainer");

    const checkForExpiringProducts = async () => {
        try {
            const response = await fetch('/api/vencimiento-alerta');
            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
            }
            const productos = await response.json();

            // Limpiar notificaciones anteriores
            alertsContainer.innerHTML = '';

            if (productos.length > 0) {
                console.log(`Hay ${productos.length} productos próximos a vencer en la próxima semana.`);
                alert.textContent = productos.length;
                alert.classList.add('badge-danger');

                // Obtener la fecha actual y formatearla
                const now = new Date();
                const formattedDate = now.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                productos.forEach(producto => {
                    const alertItem = document.createElement('a');
                    alertItem.href = '#';
                    alertItem.classList.add('dropdown-item', 'd-flex', 'align-items-center');

                    alertItem.innerHTML = `
                        <div class="mr-3">
                            <div class="icon-circle bg-warning">
                                <i class="fas fa-exclamation-triangle text-white"></i>
                            </div>
                        </div>
                        <div>
                            <div class="small text-gray-500">${formattedDate}</div>
                            <span class="font-weight-bold">El producto ${producto.nombre} vencerá el ${producto.fechav}</span>
                        </div>
                        <button class="btn btn-sm btn-danger ml-auto" onclick="markAsInactive(${producto.id}, this)">X</button>
                    `;

                    alertsContainer.appendChild(alertItem);
                });
            } else {
                alert.textContent = 0;
                messageContainer.innerHTML = '<div class="alert alert-success">No hay productos próximos a vencer</div>';

                alert.classList.remove('badge-danger');
            }
        } catch (error) {
            console.error('Error al verificar productos próximos a vencer:', error);
        }
    };

    // Verificar cada minuto
    setInterval(checkForExpiringProducts, 5000);
});

async function markAsInactive(productId, buttonElement) {
    try {
        const response = await fetch(`/api/notificacion/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: 'inactivo' })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar la notificación');
        }

        // Eliminar la notificación del DOM
        const alertItem = buttonElement.closest('a');
        if (alertItem) {
            alertItem.remove();
        }

        // Actualizar la cantidad de notificaciones en el icono de campana
        const alert = document.getElementById("alertc");
        const currentCount = parseInt(alert.textContent, 10);
        if (currentCount > 0) {
            alert.textContent = currentCount - 1;
        }
    } catch (error) {
        console.error('Error al marcar la notificación como inactiva:', error);
    }
}
