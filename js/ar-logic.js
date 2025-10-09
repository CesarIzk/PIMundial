// js/ar-logic.js

document.addEventListener('DOMContentLoaded', async () => {
  // Obtenemos todos los elementos del DOM
  const sceneEl = document.querySelector('#ar-scene');
  const infoPanel = document.getElementById('info-panel');
  const closeButton = document.getElementById('close-button');
  const startOverlay = document.getElementById('start-overlay');
  const startButton = document.getElementById('start-button');

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

  // --- LÓGICA DE ARRANQUE CORREGIDA ---
  // Añadimos el listener al botón directamente. No esperamos a 'arReady'.
  startButton.addEventListener('click', () => {
    const arSystem = sceneEl.systems["mindar-image-system"];
    startOverlay.style.display = 'none'; // Oculta la pantalla de inicio
    arSystem.start(); // ¡Inicia la cámara y la detección!
  });
  // --- FIN DE LA CORRECCIÓN ---


  // Listeners para los eventos de MindAR y el botón de cerrar
  sceneEl.addEventListener('targetFound', event => showInfoPanel(event.detail.targetIndex));
  closeButton.addEventListener('click', hideInfoPanel);
});