document.addEventListener('DOMContentLoaded', async () => {
    const sceneEl = document.querySelector('#ar-scene');
    const tapToStartOverlay = document.getElementById('tap-to-start-overlay');
    const loader = document.getElementById('loader');

    let arData = [];

    // --- FUNCIÓN PARA CONSTRUIR LA ESCENA (sin cambios) ---
    const buildARScene = (dataArray) => {
        // ... (El código de la función buildARScene que ya tienes va aquí) ...
        const assetsEl = document.createElement('a-assets');
        sceneEl.appendChild(assetsEl);

        dataArray.forEach((data, index) => {
            const targetEl = sceneEl.querySelector(`[mindar-image-target="targetIndex: ${index}"]`);
            if (!targetEl) return;

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

            const menuContainer = document.createElement('a-entity');
            menuContainer.setAttribute('id', `menu-container-${index}`);
            menuContainer.setAttribute('position', '0 0.6 0');
            menuContainer.setAttribute('visible', 'false');

            const contentContainer = document.createElement('a-entity');
            contentContainer.setAttribute('id', `content-container-${index}`);
            contentContainer.setAttribute('visible', 'false');
            
            const buttons = [
                { id: `btn-model-${index}`, text: 'Ver Modelo 3D', pos: '-0.5 0 0', panel: 'model' },
                { id: `btn-video-${index}`, text: 'Ver Video', pos: '0.5 0 0', panel: 'video' },
                { id: `btn-trivia-${index}`, text: 'Jugar Trivia', pos: '0 -0.3 0', panel: 'trivia' },
            ];

            buttons.forEach(btnInfo => {
                const button = document.createElement('a-plane');
                button.setAttribute('id', btnInfo.id);
                button.setAttribute('class', 'clickable');
                button.setAttribute('color', '#0A192F');
                button.setAttribute('width', '0.9');
                button.setAttribute('height', '0.25');
                button.setAttribute('position', btnInfo.pos);
                button.innerHTML = `<a-text value="${btnInfo.text}" align="center" color="#FFF" width="1.8"></a-text>`;
                menuContainer.appendChild(button);
                button.addEventListener('click', () => showPanel(index, btnInfo.panel));
            });
            
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
            backButton.setAttribute('class', 'clickable');
            backButton.setAttribute('color', '#E31B23');
            backButton.setAttribute('width', '0.5');
            backButton.setAttribute('height', '0.2');
            backButton.setAttribute('position', '0 -0.8 0');
            backButton.innerHTML = `<a-text value="Volver" align="center" color="#FFF" width="1.5"></a-text>`;
            contentContainer.appendChild(backButton);
            backButton.addEventListener('click', () => showMenu(index));

            targetEl.appendChild(menuContainer);
            targetEl.appendChild(contentContainer);
        });
    };

    // --- El resto de tus funciones (showMenu, showPanel, buildTrivia) van aquí sin cambios ---
    // ...

    // --- FLUJO DE ARRANQUE Y EVENTOS (AQUÍ ESTÁ EL CAMBIO) ---
    const startExperience = () => {
        const arSystem = sceneEl.systems["mindar-image-system"];
        tapToStartOverlay.style.display = 'none';
        loader.style.display = 'block';
        arSystem.start();
    };
    
    // Escucha el primer clic en CUALQUIER PARTE del cuerpo de la página
    document.body.addEventListener('click', startExperience, { once: true });

    sceneEl.addEventListener('arReady', () => {
        loader.style.display = 'none';
    });

    // Eventos para mostrar/ocultar la UI principal
    sceneEl.addEventListener('targetFound', event => {
        showMenu(event.detail.targetIndex);
    });
    sceneEl.addEventListener('targetLost', event => {
        showMenu(event.detail.targetIndex); 
        document.querySelector(`#menu-container-${event.detail.targetIndex}`).setAttribute('visible', 'false');
    });

    // Carga de datos
    try {
        const response = await fetch('./js/ar-data.json');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        arData = await response.json();
        buildARScene(arData);
    } catch (error) {
        console.error("❌ Fallo crítico al cargar ar-data.json:", error);
    }
});