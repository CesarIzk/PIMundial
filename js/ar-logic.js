// js/ar-logic.js

document.addEventListener('DOMContentLoaded', async () => {
  const sceneEl = document.querySelector('#ar-scene');
  const startOverlay = document.getElementById('start-overlay');
  const startButton = document.getElementById('start-button');
  const loader = document.getElementById('loader');

  let countryData = [];

  // Función para crear las entidades de AR
  const createAREntities = (dataArray) => {
    const assetsEl = document.createElement('a-assets');
    sceneEl.appendChild(assetsEl);

    dataArray.forEach((data, index) => {
      const targetEl = sceneEl.querySelector(`[mindar-image-target="targetIndex: ${index}"]`);
      if (!targetEl) return;

      // --- ASSETS ---
      const videoAsset = document.createElement('video');
      videoAsset.setAttribute('id', `video-asset-${index}`);
      videoAsset.setAttribute('src', data.video);
      videoAsset.setAttribute('crossorigin', 'anonymous');
      videoAsset.setAttribute('loop', 'true');
      videoAsset.setAttribute('playsinline', 'true');
      videoAsset.setAttribute('muted', 'true');
      assetsEl.appendChild(videoAsset);

      // --- CONTENIDO 3D ---
      const contentGroup = document.createElement('a-entity');
      
      const titleText = document.createElement('a-text');
      titleText.setAttribute('value', data.title);
      titleText.setAttribute('color', '#FFF');
      titleText.setAttribute('width', '2');
      titleText.setAttribute('position', '0 0.6 0');
      titleText.setAttribute('align', 'center');
      contentGroup.appendChild(titleText);
      
      const videoPlane = document.createElement('a-video');
      videoPlane.setAttribute('src', `#video-asset-${index}`);
      videoPlane.setAttribute('width', '1');
      videoPlane.setAttribute('height', '0.56'); // Proporción 16:9
      contentGroup.appendChild(videoPlane);

      targetEl.appendChild(contentGroup);

      // --- Lógica de reproducción de video ---
      targetEl.addEventListener('targetFound', () => {
        console.log(`Target ${index} encontrado. Reproduciendo video.`);
        videoAsset.play();
      });
      targetEl.addEventListener('targetLost', () => {
        console.log(`Target ${index} perdido. Pausando video.`);
        videoAsset.pause();
        videoAsset.currentTime = 0;
      });
    });
  };

  // --- FLUJO PRINCIPAL ---
  try {
    const response = await fetch('./js/ar-data.json');
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    countryData = await response.json();
    console.log('✅ Datos de AR cargados:', countryData);
    
    // Una vez que los datos están listos, creamos las entidades
    createAREntities(countryData);

  } catch (error) {
    console.error("❌ Fallo crítico al cargar ar-data.json:", error);
  }

  // --- Lógica de la interfaz de usuario ---
  startButton.addEventListener('click', () => {
    const arSystem = sceneEl.systems["mindar-image-system"];
    startOverlay.style.display = 'none';
    loader.style.display = 'block';
    arSystem.start();
  });
  
  sceneEl.addEventListener('arReady', () => {
    loader.style.display = 'none';
    console.log('🟢 AR listo');
  });
});