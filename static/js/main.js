window.addEventListener("DOMContentLoaded", () => {
  const raw = document.getElementById("history-data").textContent;
  let history = JSON.parse(raw);

  const ctx = document.getElementById("lineChart").getContext("2d");
  const historyCountElem = document.getElementById("history-count");
  const tempElem = document.getElementById("temperature");
  const effElem = document.getElementById("efficiency");
  const timestampElem = document.getElementById("timestamp");
  const cityInput = document.getElementById("city");

  let autoUpdatePaused = false;
  let intervalId;

  function updateHistoryCount() {
    if (historyCountElem) {
      historyCountElem.textContent = `Histórico (últimos ${history.length})`;
    }
  }

  const createChart = (data) => {
    const labels = data.map(item => item[2]);
    const tempData = data.map(item => item[0]);
    const effData = data.map(item => item[1]);

    return new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Temperatura (°C)",
            data: tempData,
            borderColor: "blue",
            borderWidth: 2,
            fill: false,
            tension: 0.2,
          },
          {
            label: "Eficiência (%)",
            data: effData,
            borderColor: "green",
            borderWidth: 2,
            fill: false,
            tension: 0.2,
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: { display: true, text: "Data/Hora" },
            ticks: {
              maxRotation: 90,
              minRotation: 45,
              maxTicksLimit: 10
            }
          },
          y: { beginAtZero: true }
        },
        plugins: {
          tooltip: {
            enabled: true
          }
        }
      }
    });
  };

  let chart = createChart(history);

  const updateData = async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      try {
        const resGeo = await fetch("/geolocate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon }),
        });
        const geoData = await resGeo.json();
        if (geoData.city) {
          cityInput.value = geoData.city;
        }
      } catch (e) {
        console.error("Erro no reverse geocode:", e);
      }

      try {
        const res = await fetch("/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon }),
        });
        const data = await res.json();
        if (data.error) {
          console.error("Erro ao atualizar dados:", data.error);
          return;
        }

        const now = new Date().toLocaleString("pt-BR");
        tempElem.textContent = data.temperature.toFixed(2) + "°C";
        effElem.textContent = data.efficiency.toFixed(2) + "%";
        timestampElem.textContent = now;

        history.unshift([data.temperature, data.efficiency, now]);
        if (history.length > 100) history.pop();

        updateHistoryCount();

        chart.destroy();
        chart = createChart(history);
      } catch (e) {
        console.error("Erro ao obter dados atualizados:", e);
      }
    }, err => {
      console.error("Geolocalização falhou:", err.message);
    });
  };

  function startInterval() {
    intervalId = setInterval(() => {
      if (!autoUpdatePaused) {
        updateData();
      }
    }, 30000);
  }

  updateHistoryCount();
  updateData();
  startInterval();

  document.getElementById("clear-history").addEventListener("click", async () => {
    if (!confirm("Deseja realmente limpar todo o histórico?")) return;
    try {
      const res = await fetch("/clear-history", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        history = [];
        updateHistoryCount();
        chart.destroy();
        chart = createChart(history);
        tempElem.textContent = "--";
        effElem.textContent = "--";
        timestampElem.textContent = "--";
      } else {
        alert("Falha ao limpar histórico: " + (result.error || ""));
      }
    } catch (e) {
      alert("Erro ao limpar histórico: " + e.message);
    }
  });

  cityInput.addEventListener("input", () => {
    autoUpdatePaused = true;
    clearInterval(intervalId);   
    startInterval();             
  });

  const toggleBtn = document.getElementById("toggle-auto-update");
  toggleBtn.addEventListener("click", () => {
    autoUpdatePaused = !autoUpdatePaused;
    toggleBtn.textContent = autoUpdatePaused ? "Reiniciar Atualização" : "Pausar Atualização";
  });
});
