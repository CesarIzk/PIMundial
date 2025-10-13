document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM Cargado. Iniciando script AR...");
    const sceneEl = document.querySelector('#ar-scene');
    const startOverlay = document.getElementById('start-overlay');
    const loader = document.getElementById('loader');
    let arData = [];

    // --- 1. FUNCIÓN PARA CONSTRUIR LA ESCENA ---
    const buildARScene = (dataArray) => {
        const assetsEl = document.createElement('a-assets');
        sceneEl.appendChild(assetsEl);

        dataArray.forEach((data, index) => {
            const targetEl = sceneEl.querySelector(`[mindar-image-target="targetIndex: ${index}"]`);
            if (!targetEl) return;

            // Pre-cargar assets...
            const modelAsset = document.createElement('a-asset-item');
            modelAsset.setAttribute('id', `model-asset-${index}`);
            modelAsset.setAttribute('src', data.model.src);
            assetsEl.appendChild(modelAsset);

            const videoAsset = document.createElement('video');
            videoAsset.setAttribute('id', `video-asset-${index}`);
            videoAsset.setAttribute('src', data.video.src);
            videoAsset.setAttribute('crossorigin', 'anonymous');
            videoAsset.setAttribute('loop', 'true');
            videoAsset.setAttribute('playsinline', 'true');
            videoAsset.setAttribute('muted', 'true');
            assetsEl.appendChild(videoAsset);

            // Crear contenedores...
            const menuContainer = document.createElement('a-entity');
            menuContainer.setAttribute('id', `menu-container-${index}`);
            menuContainer.setAttribute('position', '0 0.6 0');
            menuContainer.setAttribute('visible', 'false');

            const contentContainer = document.createElement('a-entity');
            contentContainer.setAttribute('id', `content-container-${index}`);
            contentContainer.setAttribute('visible', 'false');
            
            // Crear botones del menú...
            const buttons = [
                { id: `btn-model-${index}`, text: 'Ver Modelo 3D', pos: '-0.5 0 0', panel: 'model' },
                { id: `btn-video-${index}`, text: 'Ver Video', pos: '0.5 0 0', panel: 'video' },
                { id: `btn-trivia-${index}`, text: 'Jugar Trivia', pos: '0 -0.3 0', panel: 'trivia' },
            ];

            buttons.forEach(btnInfo => {
                const button = document.createElement('a-plane');
                button.setAttribute('id', btnInfo.id);
                button.setAttribute('class', 'clickable'); // Importante para el raycaster
                button.setAttribute('color', '#0A192F');
                button.setAttribute('width', '0.9');
                button.setAttribute('height', '0.25');
                button.setAttribute('position', btnInfo.pos);
                button.innerHTML = `<a-text value="${btnInfo.text}" align="center" color="#FFF" width="1.8"></a-text>`;
                menuContainer.appendChild(button);
                
                // 🔥 CORRECCIÓN: Usar solo 'click'. El raycaster de A-Frame convierte el toque en un click.
                button.addEventListener('click', () => showPanel(index, btnInfo.panel));
            });
            
            // Crear paneles de contenido...
            const modelPanel = document.createElement('a-entity');
            modelPanel.setAttribute('id', `model-panel-${index}`);
            modelPanel.setAttribute('visible', 'false');
            modelPanel.innerHTML = `<a-gltf-model src="#model-asset-${index}" scale="${data.model.scale}"></a-gltf-model><a-text value="${data.model.infoText}" align="center" color="#FFF" width="2" position="0 -0.5 0"></a-text>`;
            contentContainer.appendChild(modelPanel);

            const videoPanel = document.createElement('a-entity');
            videoPanel.setAttribute('id', `video-panel-${index}`);
            videoPanel.setAttribute('visible', 'false');
            videoPanel.innerHTML = `<a-video src="#video-asset-${index}" width="1.6" height="0.9"></a-video><a-text value="${data.video.infoText}" align="center" color="#FFF" width="2" position="0 -0.6 0"></a-text>`;
            contentContainer.appendChild(videoPanel);
            
            const triviaPanel = document.createElement('a-entity');
            triviaPanel.setAttribute('id', `trivia-panel-${index}`);
            triviaPanel.setAttribute('visible', 'false');
            contentContainer.appendChild(triviaPanel);

            const backButton = document.createElement('a-plane');
            backButton.setAttribute('class', 'clickable'); // Importante para el raycaster
            backButton.setAttribute('color', '#E31B23');
            backButton.setAttribute('width', '0.5');
            backButton.setAttribute('height', '0.2');
            backButton.setAttribute('position', '0 -0.8 0');
            backButton.innerHTML = `<a-text value="Volver" align="center" color="#FFF" width="1.5"></a-text>`;
            contentContainer.appendChild(backButton);
            
            // 🔥 CORRECCIÓN: Usar solo 'click'.
            backButton.addEventListener('click', () => showMenu(index));

            targetEl.appendChild(menuContainer);
            targetEl.appendChild(contentContainer);
        });
    };

    // --- 2. FUNCIONES AUXILIARES (sin cambios) ---
    const showMenu = (index) => { /* ... tu código ... */ };
    const showPanel = (index, panelType) => { /* ... tu código ... */ };
    const buildTrivia = (index) => { /* ... tu código ... */ };

    // --- 4. FLUJO DE ARRANQUE Y EVENTOS (CORREGIDO) ---
    
    // Función para iniciar la experiencia AR
    const startExperience = () => {
        // Removemos los listeners para que no se ejecute dos veces
        document.body.removeEventListener('click', startExperience);
        document.body.removeEventListener('touchstart', startExperience);

        const arSystem = sceneEl.systems["mindar-image-system"];
        startOverlay.style.display = 'none';
        loader.style.display = 'block';
        arSystem.start();
    };
    
    // Escuchamos tanto el clic como el toque para iniciar
    document.body.addEventListener('click', startExperience);
    document.body.addEventListener('touchstart', startExperience);

    sceneEl.addEventListener('arReady', () => {
        loader.style.display = 'none';
    });

    // Eventos para mostrar/ocultar la UI principal
    sceneEl.addEventListener('targetFound', event => {
        showMenu(event.detail.targetIndex);
    });
    sceneEl.addEventListener('targetLost', event => {
        const menu = document.querySelector(`#menu-container-${event.detail.targetIndex}`);
        if (menu) menu.setAttribute('visible', 'false');
        
        const content = document.querySelector(`#content-container-${event.detail.targetIndex}`);
        if (content) content.setAttribute('visible', 'false');
    });

    // Carga de datos
    try {
        const response = await fetch('./js/ar-data.json');
        arData = await response.json();
        console.log('✅ Datos de AR cargados:', arData);
        buildARScene(arData);
    } catch (error) {
        console.error("❌ Fallo crítico al cargar ar-data.json:", error);
    }
});