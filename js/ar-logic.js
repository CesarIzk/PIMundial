// ===============================================
// 1. REGISTRO DEL COMPONENTE DE VIDEO (MANTENER ARRIBA)
// ===============================================
AFRAME.registerComponent('video-on-target', {
  schema: {
    targetIndex: { type: 'number', default: -1 }
  },
  init: function () {
    // Asegúrate de que estamos seleccionando la etiqueta <video> real
    this.videoEl = document.querySelector(`#video-asset-${this.data.targetIndex}`);

    if (this.videoEl) {
      this.videoEl.muted = true;
      this.videoEl.pause();

      const targetEl = this.el; // El elemento con mindar-image-target
      
      targetEl.addEventListener('targetFound', () => {
        console.log(`[Video ${this.data.targetIndex}] TargetFound: Reproduciendo.`);
        this.videoEl.play();
      });

      targetEl.addEventListener('targetLost', () => {
        console.log(`[Video ${this.data.targetIndex}] TargetLost: Pausando.`);
        this.videoEl.pause();
        this.videoEl.currentTime = 0;
      });
    }
  }
});


// ===============================================
// 2. LÓGICA PRINCIPAL (CARGA Y CREACIÓN DE ENTIDADES 3D)
// ===============================================
document.addEventListener('DOMContentLoaded', async () => {
  const sceneEl = document.querySelector('#ar-scene');
  // infoPanel, closeButton ya NO son necesarios, pues estamos en 3D
  const startOverlay = document.getElementById('start-overlay');
  const startButton = document.getElementById('start-button');
  const loader = document.getElementById('loader');

  let countryData = [];
  try {
    const response = await fetch('./js/ar-data.json');
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    countryData = await response.json();
    console.log('✅ DATOS CARGADOS:', countryData);
    
    // 🔥 PASO CLAVE: CREAR EL CONTENIDO 3D DINÁMICAMENTE
    createAREntities(sceneEl, countryData);
    
  } catch (error) {
    console.error("❌ FALLO CRÍTICO al cargar ar-data.json:", error);
  }

  // Función principal para crear y adjuntar entidades 3D
  function createAREntities(scene, dataArray) {
    const assetsEl = scene.querySelector('a-assets') || document.createElement('a-assets');
    if (!scene.querySelector('a-assets')) scene.prepend(assetsEl);
    
    dataArray.forEach((data, index) => {
      const targetEl = scene.querySelector(`[mindar-image-target="targetIndex: ${index}"]`);
      if (!targetEl) return;

      // --- 1. Crear ASSETS (Imágenes y Videos) ---
      
      // Imagen Asset
      const imgAsset = document.createElement('img');
      imgAsset.setAttribute('id', `image-asset-${index}`);
      imgAsset.setAttribute('crossorigin', 'anonymous');
      imgAsset.setAttribute('src', data.image);
      assetsEl.appendChild(imgAsset);
      
      // Video Asset
      const videoAsset = document.createElement('video');
      videoAsset.setAttribute('id', `video-asset-${index}`);
      videoAsset.setAttribute('crossorigin', 'anonymous');
      videoAsset.setAttribute('loop', 'true');
      videoAsset.setAttribute('playsinline', 'true');
      videoAsset.setAttribute('src', data.video);
      assetsEl.appendChild(videoAsset);

      // --- 2. Crear ENTIDADES 3D FLOTANTES ---
      
      // Contenedor de la info flotante (para aplicar una rotación general, si quieres)
      const infoContainer = document.createElement('a-entity');
      infoContainer.setAttribute('position', '0 0 0.1'); // Flota un poco (0.1m) sobre el marcador
      // Puedes usar una animación 'float' CSS si lo deseas, o un componente A-Frame

      // 🅰️ TÍTULO (Arriba)
      const titleText = document.createElement('a-text');
      titleText.setAttribute('value', data.title);
      titleText.setAttribute('color', '#FFD700'); // Color dorado
      titleText.setAttribute('width', '1.5'); 
      titleText.setAttribute('position', '0 0.8 0'); // Posición superior
      titleText.setAttribute('align', 'center');
      infoContainer.appendChild(titleText);

      // 🅱️ IMAGEN (Izquierda)
      const imageEl = document.createElement('a-image');
      imageEl.setAttribute('src', `#image-asset-${index}`);
      imageEl.setAttribute('width', '0.6');
      imageEl.setAttribute('height', '0.5');
      imageEl.setAttribute('position', '-0.4 0.3 0');
      infoContainer.appendChild(imageEl);

      // 🇨 VIDEO (Derecha)
      const videoEl = document.createElement('a-video');
      videoEl.setAttribute('src', `#video-asset-${index}`);
      videoEl.setAttribute('width', '0.6');
      videoEl.setAttribute('height', '0.5');
      videoEl.setAttribute('position', '0.4 0.3 0');
      videoEl.setAttribute('geometry', 'primitive: plane');
      // Adjuntar el componente de lógica de video (apuntando al target padre)
      targetEl.setAttribute('video-on-target', { targetIndex: index }); 
      infoContainer.appendChild(videoEl);

      // 🇩 TEXTO (Parte inferior y central)
      const textEl = document.createElement('a-text');
      textEl.setAttribute('value', data.text);
      textEl.setAttribute('color', '#FFFFFF');
      textEl.setAttribute('width', '1.5'); // Ancho para que el texto se ajuste
      textEl.setAttribute('position', '0 -0.4 0'); // Posición inferior central
      textEl.setAttribute('align', 'center');
      infoContainer.appendChild(textEl);

      // Adjuntar el contenedor al target
      targetEl.appendChild(infoContainer);
    });
  }

  // --- Lógica de la interfaz de usuario (Start Button, Loader) ---
  
  startButton.addEventListener('click', () => {
    const arSystem = sceneEl.systems["mindar-image-system"];
    startOverlay.style.display = 'none';
    loader.style.display = 'block';
    // Pequeño retraso para asegurar que los assets hayan sido inyectados al DOM
    setTimeout(() => {
      arSystem.start();
    }, 100);
  });

  sceneEl.addEventListener('arReady', () => {
    loader.style.display = 'none';
    console.log('🟢 AR listo');
  });

  // Ya NO necesitamos escuchar 'targetFound'/'targetLost' porque la lógica
  // de visibilidad de las entidades 3D y el video está gestionada
  // automáticamente por el sistema MindAR y el componente 'video-on-target'.
  
  // El 'closeButton' ya NO es necesario porque la información se oculta al perder el target.
});