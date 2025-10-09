// js/ar-logic.js

document.addEventListener('DOMContentLoaded', async () => {
  const sceneEl = document.querySelector('#ar-scene');
  const infoPanel = document.getElementById('info-panel');
  const closeButton = document.getElementById('close-button');
  const startOverlay = document.getElementById('start-overlay');
  const startButton = document.getElementById('start-button');
  const loader = document.getElementById('loader');

 let countryData = [];
  try {
    const response = await fetch('/js/ar-data.json');
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    countryData = await response.json();
    console.log('DATOS CARGADOS:', countryData); // PISTA 1
  } catch (error) {
    console.error("FALLO CRÍTICO al cargar ar-data.json:", error);
  }

  const showInfoPanel = (index) => {
    console.log(`FUNCIÓN: showInfoPanel llamada con el índice: ${index}`); // PISTA 3
    const data = countryData[index];
   if (!data) {
      console.error(`ERROR: No se encontraron datos para el índice ${index}. Revisa el orden en tu .mind y en ar-data.json.`); // PISTA 4
      return;
    }
        console.log('FUNCIÓN: Mostrando datos para:', data.title); // PISTA 5

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

  startButton.addEventListener('click', () => {
    const arSystem = sceneEl.systems["mindar-image-system"];
    startOverlay.style.display = 'none';
    loader.style.display = 'block';
    
    // --- INICIO DE LA CORRECCIÓN ---
    // Añadimos un pequeño retardo para dar tiempo a A-Frame a inicializar todo
    setTimeout(() => {
      arSystem.start();
    }, 100); // 100 milisegundos suele ser suficiente
    // --- FIN DE LA CORRECCIÓN ---
  });

  sceneEl.addEventListener('arReady', () => {
    loader.style.display = 'none';
  });

 sceneEl.addEventListener('targetFound', event => {
    console.log('EVENTO: ¡Target encontrado!'); // PISTA 2
    if (event.detail && event.detail.targetIndex !== undefined) {
      showInfoPanel(event.detail.targetIndex);
    }
  });


  closeButton.addEventListener('click', hideInfoPanel);
});