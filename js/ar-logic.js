document.addEventListener("DOMContentLoaded", () => {
  const sceneEl = document.querySelector("a-scene");
  const loader = document.getElementById("loader");
  let arData = [];

  // 1️⃣ Cargar datos AR desde JSON
  fetch("./js/ar-data.json")
    .then(res => res.json())
    .then(data => {
      arData = data;
      console.log("✅ Datos AR cargados:", arData);
      buildARScene(arData);
    })
    .catch(err => console.error("❌ Error cargando AR data:", err));

  // 2️⃣ MindAR listo
  sceneEl.addEventListener("arReady", () => {
    loader.style.display = "none";
    console.log("🚀 MindAR iniciado automáticamente. Cámara activa.");
  });

  // 3️⃣ Si hay error de inicialización
  sceneEl.addEventListener("arError", (err) => {
    loader.innerText = "❌ Error al iniciar MindAR";
    console.error("Error al iniciar AR:", err);
  });

  // 4️⃣ Construcción dinámica de la escena
  function buildARScene(arData) {
    arData.forEach((data, index) => {
      // Crear target
      const targetEl = document.createElement("a-entity");
      targetEl.setAttribute("mindar-image-target", `targetIndex: ${index}`);
      sceneEl.appendChild(targetEl);

      // Contenedor principal del contenido
      const contentContainer = document.createElement("a-entity");
      contentContainer.setAttribute("visible", "false");
      contentContainer.setAttribute("position", "0 0 0");
      targetEl.appendChild(contentContainer);

      // Nombre del país
      const nameText = document.createElement("a-text");
      nameText.setAttribute("value", data.targetName);
      nameText.setAttribute("align", "center");
      nameText.setAttribute("color", "#FFD700");
      nameText.setAttribute("position", "0 0.4 0");
      nameText.setAttribute("width", "2");
      contentContainer.appendChild(nameText);

      // Modelo 3D
      if (data.model && data.model.src) {
        const model = document.createElement("a-gltf-model");
        model.setAttribute("src", data.model.src);
        model.setAttribute("scale", data.model.scale || "0.01 0.01 0.01");
        model.setAttribute("position", "0 -0.1 0");
        model.setAttribute("rotation", "0 180 0");
        contentContainer.appendChild(model);
      }

      // Video
      if (data.video && data.video.src) {
        const video = document.createElement("video");
        video.setAttribute("id", `video-${index}`);
        video.setAttribute("src", data.video.src);
        video.setAttribute("loop", "true");
        video.setAttribute("playsinline", "");
        video.muted = true; // 🔇 evita bloqueo de autoplay
        document.body.appendChild(video);

        const videoPlane = document.createElement("a-video");
        videoPlane.setAttribute("src", `#video-${index}`);
        videoPlane.setAttribute("width", "1.2");
        videoPlane.setAttribute("height", "0.7");
        videoPlane.setAttribute("position", "0 0.5 0");
        contentContainer.appendChild(videoPlane);
      }

      // Trivia (pregunta)
      if (data.trivia && data.trivia.question) {
        const triviaText = document.createElement("a-text");
        triviaText.setAttribute("value", `❓ ${data.trivia.question}`);
        triviaText.setAttribute("align", "center");
        triviaText.setAttribute("color", "#00FFFF");
        triviaText.setAttribute("width", "2.2");
        triviaText.setAttribute("position", "0 -0.5 0");
        contentContainer.appendChild(triviaText);
      }

      // 🎯 Eventos de detección
      targetEl.addEventListener("targetFound", () => {
        console.log(`📸 Target detectado: ${data.targetName}`);
        contentContainer.setAttribute("visible", "true");

        // reproducir video si existe
        const videoEl = document.getElementById(`video-${index}`);
        if (videoEl) {
          videoEl.play().catch(err => console.warn("⚠️ No se pudo reproducir el video:", err));
        }
      });

      targetEl.addEventListener("targetLost", () => {
        console.log(`📴 Target perdido: ${data.targetName}`);
        contentContainer.setAttribute("visible", "false");

        // pausar video si existe
        const videoEl = document.getElementById(`video-${index}`);
        if (videoEl) videoEl.pause();
      });
    });

    console.log("📦 Escena AR construida correctamente.");
  }
});
