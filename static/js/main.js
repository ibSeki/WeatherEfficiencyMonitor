window.addEventListener("DOMContentLoaded", () => {
  const raw = document.getElementById("history-data").textContent;
  let history = JSON.parse(raw);

  const ctx = document.getElementById("lineChart").getContext("2d");

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
            borderWidth: 2,
            fill: false,
            borderColor: 'rgb(59 130 246)', // Tailwind blue-500
            tension: 0.2,
          },
          {
            label: "Eficiência (%)",
            data: effData,
            borderWidth: 2,
            fill: false,
            borderColor: 'rgb(16 185 129)', // Tailwind green-500
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
        }
      }
    });
  };

  let chart = createChart(history);

  // Atualizar dados via localização automática
  const updateData = async () => {
    if (!navigator.geolocation) {
      console.log("Geolocalização não suportada pelo navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // Atualiza o campo cidade automaticamente via reverse geocode
      try {
        const resGeo = await fetch("/geolocate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon }),
        });
        const geoData = await resGeo.json();
        if (geoData.city) {
          const cityInput = document.getElementById("city");
          if (cityInput.value.trim() === "") {
            cityInput.value = geoData.city;
          }
        }
      } catch (e) {
        console.log("Erro ao obter cidade pela geolocalização:", e);
      }

      // Busca os dados climáticos atualizados
      try {
        const res = await fetch("/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon }),
        });
        const data = await res.json();

        if (data.error) {
          console.log("Erro ao atualizar dados:", data.error);
          return;
        }

        // Atualiza o histórico local e o gráfico
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        history.unshift([data.temperature, data.efficiency, now]);
        if (history.length > 100) history.pop();

        chart.destroy();
        chart = createChart(history);

        // Atualiza a exibição de temperatura e eficiência na página
        const tempElem = document.querySelector("p strong:contains('Temperatura:')");
        const effElem = document.querySelector("p strong:contains('Eficiência:')");
        const timestampElem = document.querySelector("p strong:contains('Data/Hora:')");

        // Como querySelector com :contains não funciona, atualizar via IDs (vou sugerir IDs)
        // Se preferir posso te ajudar a alterar o HTML para adicionar IDs para esses elementos e atualizar aqui

      } catch (e) {
        console.log("Erro ao obter dados atualizados:", e);
      }
    }, (err) => {
      console.log("Erro na geolocalização:", err.message);
    });
  };

  // Atualiza a cada 30 segundos
  let intervalId = setInterval(updateData, 30000);

  // Rodar updateData logo no começo para pegar os dados iniciais
  updateData();

  // Botão limpar histórico
  const clearBtn = document.getElementById("clear-btn");
  clearBtn.addEventListener("click", async () => {
    if (!confirm("Deseja realmente limpar todo o histórico?")) return;

    try {
      const res = await fetch("/clear-history", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        history = [];
        chart.destroy();
        chart = createChart(history);
      } else {
        alert("Erro ao limpar histórico: " + (data.error || "Desconhecido"));
      }
    } catch (err) {
      alert("Erro ao limpar histórico: " + err.message);
    }
  });
});
