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
      //this.videoEl.muted = false;
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
  // ELIMINADAS: startOverlay y startButton, ya no existen en el DOM.
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
      
      // Contenedor de la info flotante (Sube el conjunto base 0.2m más alto)
      const infoContainer = document.createElement('a-entity');
      // Posición base de todo el conjunto. Z=0.1 es justo sobre el marcador.
      infoContainer.setAttribute('position', '0 0.2 0.1'); 

      // 🅰️ TÍTULO (Arriba)
      const titleText = document.createElement('a-text');
      titleText.setAttribute('value', data.title);
      titleText.setAttribute('color', '#FFD700'); 
      titleText.setAttribute('width', '1.2'); // AJUSTE: Reducir de 1.5 a 1.2
      titleText.setAttribute('position', '0 0.65 0'); 
      titleText.setAttribute('align', 'center');
      infoContainer.appendChild(titleText);

      // 🅱️ IMAGEN (Izquierda)
      const imageEl = document.createElement('a-image');
      imageEl.setAttribute('src', `#image-asset-${index}`);
      imageEl.setAttribute('width', '0.6');
      imageEl.setAttribute('height', '0.5');
      // Mueve a la izquierda
      imageEl.setAttribute('position', '-0.35 0.2 0'); // AJUSTE: Mueve ligeramente hacia el centro (-0.4 a -0.35)
      infoContainer.appendChild(imageEl);

      // 🇨 VIDEO (Derecha)
      const videoEl = document.createElement('a-video');
      videoEl.setAttribute('src', `#video-asset-${index}`);
      videoEl.setAttribute('width', '0.6');
      videoEl.setAttribute('height', '0.5');
      // Mueve a la derecha
      videoEl.setAttribute('position', '0.35 0.2 0'); // AJUSTE: Mueve ligeramente hacia el centro (0.4 a 0.35)
      videoEl.setAttribute('geometry', 'primitive: plane');
      targetEl.setAttribute('video-on-target', { targetIndex: index }); 
      infoContainer.appendChild(videoEl);

      // 🇩 TEXTO (Parte inferior y central)
      const textEl = document.createElement('a-text');
      textEl.setAttribute('value', data.text);
      textEl.setAttribute('color', '#FFFFFF');
      textEl.setAttribute('width', '1.0'); // Reducción de ancho CRÍTICA para evitar el corte inferior
      textEl.setAttribute('position', '0 -0.25 0'); // Posición elevada para evitar el borde de la pantalla
      textEl.setAttribute('align', 'center');
      infoContainer.appendChild(textEl);

      // Adjuntar el contenedor al target
      targetEl.appendChild(infoContainer);
    });
  }

  // --- Lógica de la interfaz de usuario (AHORA AUTOMÁTICA) ---
  
  // Ya no necesitamos la lógica del botón. El loader se maneja al iniciar MindAR.
  
  sceneEl.addEventListener('arReady', () => {
    loader.style.display = 'none';
    console.log('🟢 AR listo');
  });

  // Opcional: Aseguramos que el loader esté visible mientras carga
  loader.style.display = 'block';

});