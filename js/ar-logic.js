// js/ar-logic.js

document.addEventListener('DOMContentLoaded', async () => {
  const sceneEl = document.querySelector('#ar-scene');
  const infoPanel = document.getElementById('info-panel');
  const closeButton = document.getElementById('close-button');

  // --- Carga de Datos ---
  // Ahora cargamos la información desde nuestro archivo JSON
  let countryData = [];
  try {
    const response = await fetch('./js/ar-data.json');
    countryData = await response.json();
  } catch (error) {
    console.error("No se pudo cargar la información de AR:", error);
    return;
  }
  // --- Fin Carga de Datos ---

  const showInfoPanel = (index) => {
    // Buscamos los datos en el array cargado usando el índice del target
    const data = countryData[index];
    if (!data) return;

    // Actualiza el contenido del panel
    document.getElementById('info-title').textContent = data.title;
    document.getElementById('info-image').src = data.image;
    document.getElementById('info-video').src = data.video;
    document.getElementById('info-text').textContent = data.text;
    
    // Muestra el panel
    infoPanel.style.display = 'flex';
    sceneEl.pause();
  };

  const hideInfoPanel = () => {
    infoPanel.style.display = 'none';
    const video = document.getElementById('info-video');
    video.pause();
    video.currentTime = 0; // Reinicia el video al cerrar
    sceneEl.play();
  };

  // Evento cuando se encuentra un target
  sceneEl.addEventListener('targetFound', event => {
    const targetIndex = event.detail.targetIndex;
    showInfoPanel(targetIndex);
  });

  closeButton.addEventListener('click', hideInfoPanel);

  // Iniciar la detección una vez que todo esté listo
  const startAR = () => {
    const arSystem = sceneEl.systems["mindar-image-system"];
    arSystem.start(); 
  }

  sceneEl.addEventListener('arReady', startAR);
});