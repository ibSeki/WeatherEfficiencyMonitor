window.addEventListener("DOMContentLoaded", () => {
  const raw = document.getElementById("history-data").textContent;
  let history = JSON.parse(raw);

  const labels = history.map(item => item[2]);
  const tempData = history.map(item => item[0]);
  const effData = history.map(item => item[1]);

  const ctx = document.getElementById("lineChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [...labels],
      datasets: [
        {
          label: "Temperatura (°C)",
          data: [...tempData],
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
        },
        {
          label: "Eficiência (%)",
          data: [...effData],
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Horário" } },
        y: { beginAtZero: true }
      }
    }
  });

  // Atualiza a cada 30s
  setInterval(() => {
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords;

      try {
        const response = await fetch("/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lon: longitude })
        });

        if (!response.ok) return;

        const result = await response.json();
        const { temperature, efficiency, timestamp } = result;

        // Atualiza arrays
        chart.data.labels.unshift(timestamp);
        chart.data.datasets[0].data.unshift(temperature);
        chart.data.datasets[1].data.unshift(efficiency);

        // Limita a 20 pontos no máximo
        if (chart.data.labels.length > 20) {
          chart.data.labels.pop();
          chart.data.datasets[0].data.pop();
          chart.data.datasets[1].data.pop();
        }

        chart.update();
      } catch (err) {
        console.error("Erro ao atualizar:", err);
      }
    });
  }, 15000); // 30 segundos
});
