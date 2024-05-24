document.addEventListener('DOMContentLoaded', function() {
  // Verificar si los datos del gráfico están disponibles
  if (typeof pieChartData !== 'undefined' && pieChartData && pieChartData.length > 0) {
      // Crear el gráfico de pie
      var ctx = document.getElementById("myPieChart");
      var myPieChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
              labels: pieChartData.map(item => item.categoria),
              datasets: [{
                  data: pieChartData.map(item => item.cantidad_vendida),
                  backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#e74a3b', '#f6c23e'], // Puedes ajustar los colores según lo desees
                  hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#d63031', '#f4b400'], // Puedes ajustar los colores según lo desees
                  hoverBorderColor: "rgba(234, 236, 244, 1)",
              }],
          },
          options: {
              maintainAspectRatio: false,
              tooltips: {
                  backgroundColor: "rgb(255,255,255)",
                  bodyFontColor: "#858796",
                  borderColor: '#dddfeb',
                  borderWidth: 1,
                  xPadding: 15,
                  yPadding: 15,
                  displayColors: false,
                  caretPadding: 10,
              },
              legend: {
                  display: false
              },
              cutoutPercentage: 80,
          },
      });
  } else {
      console.log('No hay datos disponibles para generar el gráfico de torta.');
  }
});
