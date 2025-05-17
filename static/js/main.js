window.addEventListener("DOMContentLoaded", () => {
  const raw               = document.getElementById("history-data").textContent;
  let history             = JSON.parse(raw);
  const ctx               = document.getElementById("lineChart").getContext("2d");
  const historyCountElem  = document.getElementById("history-count");
  const tempElem          = document.getElementById("temperature");
  const effElem           = document.getElementById("efficiency");
  const timestampElem     = document.getElementById("timestamp");
  const cityInput         = document.getElementById("city");
  const cityDisplay       = document.getElementById("city-display");
  let   autoUpdatePaused  = false;
  let   intervalId;
  let   lastTimestamp     = null;
  let   chart             = null;

  function updateHistoryCount() {
    if (historyCountElem) {
      historyCountElem.textContent = `Histórico (últimos ${history.length})`;
    }
  }

  function createChart(data) {
  const labels = data.map(item => new Date(item[2]).toLocaleString("pt-BR"));
  const tempData = data.map(item => item[0]);
  const effData = data.map(item => item[1]);
  const cities = data.map(item =>
    (typeof item[3] === "string" && item[3].trim() !== "")
      ? item[3].trim()
      : "ND"
  );

  
  if (data.length === 0) {
    ctx.canvas.height = 100; 
  } else if (data.length < 10) {
    ctx.canvas.height = 200; 
  } else {
    ctx.canvas.height = 400; 
  }

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Temperatura (°C)", data: tempData, borderColor: "blue",  borderWidth: 2, fill: false, tension: 0.2 },
        { label: "Eficiência (%)",    data: effData,  borderColor: "green", borderWidth: 2, fill: false, tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // importante para respeitar o height definido
      scales: {
        x: { 
          display: true, 
          title: { display: true, text: "Data/Hora" },
          ticks: data.length === 0 ? { display: false } : { maxRotation: 45, minRotation: 0, maxTicksLimit: 15 }
        },
        y: { beginAtZero: true }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: ctxArr => {
              const idx = ctxArr[0].dataIndex;
              return `${ctxArr[0].label} — ${cities[idx]}`;
            }
          }
        }
      }
    }
  });
}


  createChart(history);
  updateHistoryCount();

  async function fetchUpdateData(lat, lon) {
    try {
      const res  = await fetch("/update", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ lat, lon })
      });
      const data = await res.json();
      return data.error ? null : data;
    } catch {
      return null;
    }
  }

  async function getCityFromGeolocation(lat, lon) {
    try {
      const res  = await fetch("/geolocate", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ lat, lon })
      });
      const json = await res.json();
      return json.city?.trim() || null;
    } catch {
      return null;
    }
  }

  async function updateFromGeolocation() {
    if (!navigator.geolocation) {
      await updateUsingManualInput();
      return;
    }

    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      let city = await getCityFromGeolocation(lat, lon);
      city = (city && city.trim()) || (cityInput?.value.trim()) || "ND";

      const data = await fetchUpdateData(lat, lon);
      if (!data) return;

      const nowISO = new Date().toISOString();
      if (nowISO === lastTimestamp) return;
      lastTimestamp = nowISO;

      if (tempElem)      tempElem.textContent      = `${data.temperature.toFixed(2)}°C`;
      if (effElem)       effElem.textContent       = `${data.efficiency.toFixed(2)}%`;
      if (timestampElem) timestampElem.textContent = new Date(nowISO).toLocaleString("pt-BR");
      if (cityDisplay)   cityDisplay.textContent   = city;
      if (cityInput)     cityInput.value           = city;

      history.unshift([data.temperature, data.efficiency, nowISO, city]);
      if (history.length > 100) history.pop();

      updateHistoryCount();
      createChart(history);
    }, async () => {
      await updateUsingManualInput();
    });
  }

  function startInterval() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      if (!autoUpdatePaused) updateFromGeolocation();
    }, 30000);
  }

  document.getElementById("clear-history")?.addEventListener("click", async () => {
    if (!confirm("Deseja realmente limpar todo o histórico?")) return;
    try {
      const res  = await fetch("/clear-history", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        history = [];
        updateHistoryCount();
        createChart(history);
        if (tempElem)      tempElem.textContent      = "--";
        if (effElem)       effElem.textContent       = "--";
        if (timestampElem) timestampElem.textContent = "--";
        if (cityDisplay)   cityDisplay.textContent   = "--";
        if (cityInput)     cityInput.value           = "";
      } else {
        alert("Falha ao limpar histórico: " + (json.error||""));
      }
    } catch (e) {
      alert("Erro ao limpar histórico: " + e.message);
    }
  });

  cityInput?.addEventListener("input", () => {
    autoUpdatePaused = true;
    clearInterval(intervalId);
    if (cityDisplay) cityDisplay.textContent = cityInput.value.trim() || "--";
  });

  document.getElementById("toggle-auto-update")?.addEventListener("click", () => {
    autoUpdatePaused = !autoUpdatePaused;
    const btn = document.getElementById("toggle-auto-update");
    if (btn) btn.textContent = autoUpdatePaused ? "Reiniciar Atualização" : "Pausar Atualização";
    if (!autoUpdatePaused) startInterval();
  });

  startInterval();
});
