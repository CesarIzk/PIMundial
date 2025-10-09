document.addEventListener('DOMContentLoaded', async () => {
  // Obtenemos todos los elementos del DOM, incluyendo el nuevo loader
  const sceneEl = document.querySelector('#ar-scene');
  const infoPanel = document.getElementById('info-panel');
  const closeButton = document.getElementById('close-button');
  const startOverlay = document.getElementById('start-overlay');
  const startButton = document.getElementById('start-button');
  const loader = document.getElementById('loader'); // <-- Elemento nuevo

  // Cargamos los datos de los países desde el archivo JSON
  let countryData = [];
  try {
    const response = await fetch('./js/ar-data.json');
    countryData = await response.json();
  } catch (error) {
    console.error("No se pudo cargar la información de AR:", error);
  }

  // --- Lógica para mostrar/ocultar el panel de información ---
  const showInfoPanel = (index) => {
    const data = countryData[index];
    if (!data) return;
    document.getElementById('info-title').textContent = data.title;
    document.getElementById('info-image').src = data.image;
    document.getElementById('info-video').src = data.video;
    document.getElementById('info-text').textContent = data.text;
    infoPanel.style.display = 'flex';
    sceneEl.pause();
  };

  const hideInfoPanel = () => {
    infoPanel.style.display = 'none';
    const video = document.getElementById('info-video');
    video.pause();
    video.currentTime = 0;
    sceneEl.play();
  };

  // --- Lógica de arranque con feedback de carga ---
  startButton.addEventListener('click', () => {
    const arSystem = sceneEl.systems["mindar-image-system"];
    startOverlay.style.display = 'none'; // Oculta la pantalla de inicio
    loader.style.display = 'block';      // <-- MUESTRA EL INDICADOR DE CARGA
    arSystem.start();                    // Inicia la cámara y la detección
  });

  // --- Listeners para los eventos ---
  sceneEl.addEventListener('targetFound', event => showInfoPanel(event.detail.targetIndex));
  closeButton.addEventListener('click', hideInfoPanel);

  // Nuevo listener que oculta el loader cuando la cámara y la AR están listas
  sceneEl.addEventListener('arReady', () => {
    loader.style.display = 'none'; // <-- OCULTA EL INDICADOR DE CARGA
  });
});