document.addEventListener('DOMContentLoaded', async () => {
  const sceneEl = document.querySelector('#ar-scene');
  const infoPanel = document.getElementById('info-panel');
  const closeButton = document.getElementById('close-button');
  const startOverlay = document.getElementById('start-overlay');
  const startButton = document.getElementById('start-button');
  const loader = document.getElementById('loader');

  let countryData = [];
  try {
    const response = await fetch('./js/ar-data.json'); // ✅ Ajuste de ruta relativa
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    countryData = await response.json();
    console.log('✅ DATOS CARGADOS:', countryData);
  } catch (error) {
    console.error("❌ FALLO CRÍTICO al cargar ar-data.json:", error);
  }

  // Muestra la info del país detectado
  const showInfoPanel = (index) => {
    console.log(`ℹ️ showInfoPanel(${index})`);
    const data = countryData[index];
    if (!data) {
      console.error(`⚠️ No se encontraron datos para el índice ${index}`);
      return;
    }

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
    setTimeout(() => {
      arSystem.start();
    }, 100);
  });

  sceneEl.addEventListener('arReady', () => {
    loader.style.display = 'none';
    console.log('🟢 AR listo');
  });

  // 🔥 Escucha los eventos correctos de detección del target
  const targets = sceneEl.querySelectorAll('[mindar-image-target]');
  targets.forEach((target, index) => {
    target.addEventListener('targetFound', () => {
      console.log(`🎯 Target encontrado: ${index}`);
      showInfoPanel(index);
    });
    target.addEventListener('targetLost', () => {
      console.log(`❌ Target perdido: ${index}`);
      hideInfoPanel();
    });
  });

  closeButton.addEventListener('click', hideInfoPanel);
});
