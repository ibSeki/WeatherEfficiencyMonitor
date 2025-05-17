window.addEventListener("DOMContentLoaded", () => {
  const cityInput = document.getElementById("city");
  const cityDisplay = document.getElementById("city-display");

  if (!cityInput.value && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch("/geolocate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lon: longitude }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.city) {
              cityInput.value = data.city;
              cityDisplay.textContent = data.city;
            }
          })
          .catch(err => console.error("Erro ao obter cidade:", err));
      },
      err => {
        console.warn("Geolocalização não permitida ou falhou:", err);
      }
    );
  }
});
