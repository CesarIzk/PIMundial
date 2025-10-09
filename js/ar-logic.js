// js/ar-logic.js

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM cargado. Iniciando script de AR...');

  // --- DEFINICIÓN DE CONSTANTES ---
  // Todas las variables se definen aquí para que sean accesibles en todo el script
  const sceneEl = document.querySelector('#ar-scene');
  const infoPanel = document.getElementById('info-panel');
  const closeButton = document.getElementById('close-button');
  const startOverlay = document.getElementById('start-overlay');
  const startButton = document.getElementById('start-button');
  const loader = document.getElementById('loader');

  // --- CARGA DE DATOS ---
  let countryData = [];
  try {
    const response = await fetch('/js/ar-data.json');
    if (!response.ok) {
        throw new Error(`Error al cargar ar-data.json: ${response.status}`);
    }
    countryData = await response.json();
    console.log('Datos de AR cargados exitosamente:', countryData);
  } catch (error) {
    console.error("FALLO CRÍTICO: No se pudo cargar la información de AR.", error);
    if (loader) loader.textContent = "Error al cargar datos.";
  }

  // --- DEFINICIÓN DE FUNCIONES ---
  const showInfoPanel = (index) => {
    console.log(`Función showInfoPanel llamada con el índice: ${index}`);
    const data = countryData[index];
    if (!data) {
      console.error(`No se encontraron datos para el índice ${index} en ar-data.json`);
      return;
    }
    console.log('Mostrando datos para:', data.title);

    document.getElementById('info-title').textContent = data.title;
    document.getElementById('info-image').src = data.image;
    document.getElementById('info-video').src = data.video;
    document.getElementById('info-text').textContent = data.text;
    
    infoPanel.style.display = 'flex';
    sceneEl.pause();
  };

  const hideInfoPanel = () => {
    console.log('Ocultando panel de información.');
    infoPanel.style.display = 'none';
    const video = document.getElementById('info-video');
    video.pause();
    video.currentTime = 0;
    sceneEl.play();
  };

  // --- ASIGNACIÓN DE EVENTOS (LISTENERS) ---
  startButton.addEventListener('click', () => {
    const arSystem = sceneEl.systems["mindar-image-system"];
    startOverlay.style.display = 'none';
    if (loader) loader.style.display = 'block';
    arSystem.start();
  });

  sceneEl.addEventListener('arReady', () => {
    if (loader) loader.style.display = 'none';
  });

  sceneEl.addEventListener('targetFound', event => {
    console.log('¡Target encontrado!');
    if (event.detail && event.detail.targetIndex !== undefined) {
      console.log('Índice del target detectado:', event.detail.targetIndex);
      showInfoPanel(event.detail.targetIndex);
    } else {
      console.warn('Evento targetFound disparado, pero sin event.detail.targetIndex.');
    }
  });

  closeButton.addEventListener('click', hideInfoPanel);
});