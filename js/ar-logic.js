document.addEventListener('DOMContentLoaded', async () => {
  // Obtenemos todos los elementos del DOM, incluyendo el nuevo loader
  const sceneEl = document.querySelector('#ar-scene');
  const infoPanel = document.getElementById('info-panel');
  const closeButton = document.getElementById('close-button');
  const startOverlay = document.getElementById('start-overlay');
  const startButton = document.getElementById('start-button');
  const loader = document.getElementById('loader'); 
  const errorMessage = document.getElementById('error-message'); // NUEVO elemento para mostrar errores

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

  // --- Lógica de arranque con manejo de errores ---
  startButton.addEventListener('click', async () => {
    const arSystem = sceneEl.systems["mindar-image-system"];
    startOverlay.style.display = 'none'; // Oculta la pantalla de inicio
    loader.style.display = 'block';      // Muestra el indicador de carga
    errorMessage.style.display = 'none'; // Oculta mensaje de error previo

    try {
      await arSystem.start(); // Intentar iniciar cámara y detección
    } catch (err) {
      loader.style.display = 'none';
      console.error("Error al iniciar AR:", err);

      // Mostrar mensaje visual al usuario
      errorMessage.textContent = "No se pudo acceder a la cámara. Verifica permisos o si otra aplicación la está usando.";
      errorMessage.style.display = 'block';
      
      // Mostrar de nuevo el overlay de inicio
      startOverlay.style.display = 'flex';
    }
  });

  // --- Listener de MindAR para errores del sistema ---
  sceneEl.addEventListener('arError', (err) => {
    loader.style.display = 'none';
    console.error("Error del sistema AR:", err);
    errorMessage.textContent = "Ocurrió un error al iniciar el sistema AR.";
    errorMessage.style.display = 'block';
    startOverlay.style.display = 'flex';
  });

  // --- Listeners para eventos de AR ---
  sceneEl.addEventListener('targetFound', event => {
    if (event.detail) {
      showInfoPanel(event.detail.targetIndex);
    }
  });

  closeButton.addEventListener('click', hideInfoPanel);

  // Oculta el loader cuando la cámara y la AR están listas
  sceneEl.addEventListener('arReady', () => {
    loader.style.display = 'none';
  });
});
