document.addEventListener('DOMContentLoaded', async () => {
    const sceneEl = document.querySelector('#ar-scene');
    const startOverlay = document.getElementById('start-overlay');
    const startButton = document.getElementById('start-button');
    const loader = document.getElementById('loader');

    let arData = [];

    // --- 1. FUNCIÓN PRINCIPAL PARA CONSTRUIR LA ESCENA ---
    const buildARScene = (dataArray) => {
        const assetsEl = document.createElement('a-assets');
        sceneEl.appendChild(assetsEl);

        dataArray.forEach((data, index) => {
            const targetEl = sceneEl.querySelector(`[mindar-image-target="targetIndex: ${index}"]`);
            if (!targetEl) return;

            // --- Pre-cargar Assets ---
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

            // --- Crear Contenedores (Menú y Paneles de Contenido) ---
            const menuContainer = document.createElement('a-entity');
            menuContainer.setAttribute('id', `menu-container-${index}`);
            menuContainer.setAttribute('position', '0 0.6 0');
            menuContainer.setAttribute('visible', 'false');

            const contentContainer = document.createElement('a-entity');
            contentContainer.setAttribute('id', `content-container-${index}`);
            contentContainer.setAttribute('visible', 'false');
            
            // --- Crear Botones del Menú ---
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
            
            // --- Crear Paneles de Contenido (inicialmente ocultos) ---
            // Panel del Modelo 3D
            const modelPanel = document.createElement('a-entity');
            modelPanel.setAttribute('id', `model-panel-${index}`);
            modelPanel.setAttribute('visible', 'false');
            modelPanel.innerHTML = `
                <a-gltf-model src="#model-asset-${index}" scale="${data.model.scale}"></a-gltf-model>
                <a-text value="${data.model.infoText}" align="center" color="#FFF" width="2" position="0 -0.5 0"></a-text>
            `;
            contentContainer.appendChild(modelPanel);

            // Panel del Video
            const videoPanel = document.createElement('a-entity');
            videoPanel.setAttribute('id', `video-panel-${index}`);
            videoPanel.setAttribute('visible', 'false');
            videoPanel.innerHTML = `
                <a-video src="#video-asset-${index}" width="1.6" height="0.9"></a-video>
                <a-text value="${data.video.infoText}" align="center" color="#FFF" width="2" position="0 -0.6 0"></a-text>
            `;
            contentContainer.appendChild(videoPanel);
            
            // Panel de Trivia (se crea al hacer clic)
            const triviaPanel = document.createElement('a-entity');
            triviaPanel.setAttribute('id', `trivia-panel-${index}`);
            triviaPanel.setAttribute('visible', 'false');
            contentContainer.appendChild(triviaPanel);

            // Botón de Volver al Menú
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

    // --- 2. FUNCIONES AUXILIARES PARA MOSTRAR/OCULTAR ---
    const showMenu = (index) => {
        document.querySelector(`#menu-container-${index}`).setAttribute('visible', 'true');
        document.querySelector(`#content-container-${index}`).setAttribute('visible', 'false');
        // Ocultar todos los paneles de contenido
        document.querySelectorAll(`#content-container-${index} > a-entity`).forEach(panel => panel.setAttribute('visible', 'false'));
        // Pausar video
        const video = document.querySelector(`#video-asset-${index}`);
        video.pause();
    };

    const showPanel = (index, panelType) => {
        document.querySelector(`#menu-container-${index}`).setAttribute('visible', 'false');
        document.querySelector(`#content-container-${index}`).setAttribute('visible', 'true');

        if (panelType === 'video') {
            document.querySelector(`#video-panel-${index}`).setAttribute('visible', 'true');
            const video = document.querySelector(`#video-asset-${index}`);
            video.play();
        } else if (panelType === 'model') {
            document.querySelector(`#model-panel-${index}`).setAttribute('visible', 'true');
        } else if (panelType === 'trivia') {
            buildTrivia(index);
            document.querySelector(`#trivia-panel-${index}`).setAttribute('visible', 'true');
        }
    };
    
    // --- 3. LÓGICA DE TRIVIA ---
    const buildTrivia = (index) => {
        const triviaData = arData[index].trivia;
        const panel = document.querySelector(`#trivia-panel-${index}`);
        panel.innerHTML = ''; // Limpiar trivia anterior

        // Pregunta
        panel.innerHTML += `<a-text value="${triviaData.question}" width="2" align="center" position="0 0.3 0"></a-text>`;
        
        // Opciones
        triviaData.options.forEach((option, i) => {
            const optionPlane = document.createElement('a-plane');
            optionPlane.setAttribute('class', 'clickable');
            optionPlane.setAttribute('width', '1');
            optionPlane.setAttribute('height', '0.2');
            optionPlane.setAttribute('color', '#006847');
            optionPlane.setAttribute('position', `0 ${-0.1 * (i * 2)} 0`);
            optionPlane.innerHTML = `<a-text value="${option}" align="center" width="2"></a-text>`;
            panel.appendChild(optionPlane);

            optionPlane.addEventListener('click', () => {
                panel.innerHTML = ''; // Limpiar al responder
                const feedbackText = (i === triviaData.answerIndex) ? triviaData.feedback : "Incorrecto, intenta de nuevo!";
                panel.innerHTML += `<a-text value="${feedbackText}" width="2" align="center"></a-text>`;
            });
        });
    };

    // --- 4. FLUJO DE ARRANQUE Y EVENTOS ---
    try {
        const response = await fetch('./js/ar-data.json');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        arData = await response.json();
        console.log('✅ Datos de AR cargados:', arData);
        buildARScene(arData);
    } catch (error) {
        console.error("❌ Fallo crítico al cargar ar-data.json:", error);
    }

    startButton.addEventListener('click', () => {
        const arSystem = sceneEl.systems["mindar-image-system"];
        startOverlay.style.display = 'none';
        loader.style.display = 'block';
        arSystem.start();
    });

    sceneEl.addEventListener('arReady', () => {
        loader.style.display = 'none';
    });

    // Eventos para mostrar/ocultar la UI principal
    sceneEl.addEventListener('targetFound', event => {
        showMenu(event.detail.targetIndex);
    });
    sceneEl.addEventListener('targetLost', event => {
        showMenu(event.detail.targetIndex); // Llama a showMenu que oculta el contenido
        document.querySelector(`#menu-container-${event.detail.targetIndex}`).setAttribute('visible', 'false');
    });
});