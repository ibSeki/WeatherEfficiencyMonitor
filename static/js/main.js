window.addEventListener("DOMContentLoaded", () => {
  const raw = document.getElementById("history-data").textContent;
  let history = JSON.parse(raw);

  const ctx = document.getElementById("lineChart").getContext("2d");
  const historyCountElem = document.getElementById("history-count");
  const tempElem = document.getElementById("temperature");
  const effElem = document.getElementById("efficiency");
  const timestampElem = document.getElementById("timestamp");
  const cityInput = document.getElementById("city");
  const cityDisplay = document.getElementById("city-display");

  let autoUpdatePaused = false;
  let intervalId;
  let lastTimestamp = null;

  function updateHistoryCount() {
    historyCountElem.textContent = `Histórico (últimos ${history.length})`;
  }

  function createChart(data) {
    const labels = data.map(item => new Date(item[2]).toLocaleString("pt-BR"));
    const tempData = data.map(item => item[0]);
    const effData = data.map(item => item[1]);
    const cities = data.map(item => {
      if (item[3] && item[3].trim() !== "") return item[3];
      return cityInput.value.trim() || "Cidade desconhecida";
    });

    return new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Temperatura (°C)",
            data: tempData,
            borderColor: "blue",
            borderWidth: 2,
            fill: false,
            tension: 0.2
          },
          {
            label: "Eficiência (%)",
            data: effData,
            borderColor: "green",
            borderWidth: 2,
            fill: false,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: { display: true, text: "Data/Hora" },
            ticks: { maxRotation: 90, minRotation: 45, maxTicksLimit: 10 }
          },
          y: { beginAtZero: true }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (ctx) => {
                const idx = ctx[0].dataIndex;
                return `${ctx[0].label} — ${cities[idx]}`;
              }
            }
          }
        }
      }
    });
  }

  let chart = createChart(history);

  async function fetchUpdateData(lat, lon) {
    try {
      const res = await fetch("/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      const data = await res.json();
      if (data.error) {
        console.error("Erro ao atualizar dados:", data.error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Erro na requisição /update:", e);
      return null;
    }
  }

  async function getCityFromGeolocation(lat, lon) {
    try {
      const res = await fetch("/geolocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      const json = await res.json();
      if (json.city && typeof json.city === "string" && json.city.trim() !== "") {
        return json.city.trim();
      }
    } catch (e) {
      console.error("Erro no reverse geocode:", e);
    }
    return null;
  }

  async function updateFromGeolocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;

      const cityFromBackend = await getCityFromGeolocation(lat, lon);
      const city = cityFromBackend || cityInput.value.trim() || "Cidade desconhecida";

      const data = await fetchUpdateData(lat, lon);
      if (!data) return;

      const nowISO = new Date().toISOString();
      if (nowISO === lastTimestamp) return;  // evita duplicação
      lastTimestamp = nowISO;

      tempElem.textContent = data.temperature.toFixed(2) + "°C";
      effElem.textContent = data.efficiency.toFixed(2) + "%";
      timestampElem.textContent = new Date(nowISO).toLocaleString("pt-BR");
      cityDisplay.textContent = city;
      cityInput.value = city;

      history.unshift([data.temperature, data.efficiency, nowISO, city]);
      if (history.length > 100) history.pop();

      updateHistoryCount();
      chart.destroy();
      chart = createChart(history);
    }, (err) => {
      console.error("Erro na geolocalização:", err.message);
    });
  }

  function startInterval() {
    intervalId = setInterval(() => {
      if (!autoUpdatePaused) updateFromGeolocation();
    }, 30000);
  }

  updateHistoryCount();
  startInterval();

  document.getElementById("clear-history").addEventListener("click", async () => {
    if (!confirm("Deseja realmente limpar todo o histórico?")) return;
    try {
      const res = await fetch("/clear-history", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        history = [];
        updateHistoryCount();
        chart.destroy();
        chart = createChart(history);
        tempElem.textContent = "--";
        effElem.textContent = "--";
        timestampElem.textContent = "--";
        cityDisplay.textContent = "--";
        cityInput.value = "";
      } else {
        alert("Falha ao limpar histórico: " + (json.error || ""));
      }
    } catch (e) {
      alert("Erro ao limpar histórico: " + e.message);
    }
  });

  cityInput.addEventListener("input", () => {
    autoUpdatePaused = true;
    clearInterval(intervalId);
    cityDisplay.textContent = cityInput.value.trim() || "--";
  });

  document.getElementById("toggle-auto-update").addEventListener("click", () => {
    autoUpdatePaused = !autoUpdatePaused;
    const btn = document.getElementById("toggle-auto-update");
    btn.textContent = autoUpdatePaused ? "Reiniciar Atualização" : "Pausar Atualização";
    if (!autoUpdatePaused) {
      clearInterval(intervalId);
      startInterval();
    }
  });
});

