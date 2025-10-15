document.addEventListener("DOMContentLoaded", async () => {
  const sceneEl = document.querySelector("a-scene");
  const overlay = document.getElementById("tap-to-start-overlay");
  const loader = document.getElementById("loader");
  let arData = [];

  try {
    // 1️⃣ Cargar datos JSON
    const response = await fetch("./js/ar-data.json");
    arData = await response.json();
    console.log("✅ Datos AR cargados:", arData);

    // 2️⃣ Esperar a que la escena esté lista
    await new Promise(resolve => {
      if (sceneEl.hasLoaded) resolve();
      else sceneEl.addEventListener("loaded", resolve);
    });
    console.log("🎬 Escena A-Frame lista.");

    // 3️⃣ Crear dinámicamente los targets MindAR
    arData.forEach((data, index) => {
      const target = document.createElement("a-entity");
      target.setAttribute("id", `target-${index}`);
      target.setAttribute("mindar-image-target", `targetIndex: ${index}`);
      sceneEl.appendChild(target);
    });

    // 4️⃣ Construir contenido AR
    buildARScene(arData);

    // 5️⃣ Configurar eventos de detección
    arData.forEach((_, index) => {
      const targetEl = document.getElementById(`target-${index}`);
      targetEl.addEventListener("targetFound", () => {
        console.log(`🎯 Target ${index} detectado`);
        showMenu(index);
      });
      targetEl.addEventListener("targetLost", () => {
        console.log(`❌ Target ${index} perdido`);
        hideMenu(index);
      });
    });

    // 6️⃣ Iniciar AR al hacer tap
    overlay.addEventListener("click", async () => {
      overlay.style.display = "none";
      loader.style.display = "block";

      try {
        const mindarSystem = sceneEl.systems["mindar-image"];
        await mindarSystem.start();

        loader.style.display = "none";
        console.log("🚀 MindAR iniciado. Cámara activa.");
      } catch (err) {
        loader.innerText = "❌ Error al iniciar MindAR";
        console.error("Error al iniciar MindAR:", err);
      }
    });

  } catch (error) {
    console.error("❌ Error general al iniciar AR:", error);
  }
});

/* ===========================================================
   FUNCIONES AUXILIARES
   =========================================================== */
function buildARScene(arData) {
  const sceneEl = document.querySelector("a-scene");

  arData.forEach((data, index) => {
    const targetEl = document.getElementById(`target-${index}`);
    if (!targetEl) return;

    const menuContainer = document.createElement("a-entity");
    menuContainer.setAttribute("id", `menu-container-${index}`);
    menuContainer.setAttribute("visible", "false");

    // 🏷 Nombre del país
    const nameText = document.createElement("a-text");
    nameText.setAttribute("value", data.targetName || `País ${index + 1}`);
    nameText.setAttribute("align", "center");
    nameText.setAttribute("position", "0 0.35 0");
    nameText.setAttribute("color", "#FFD700");
    nameText.setAttribute("width", "2");
    menuContainer.appendChild(nameText);

    // 🏗 Modelo 3D
    if (data.model?.src) {
      const model = document.createElement("a-gltf-model");
      model.setAttribute("src", data.model.src);
      model.setAttribute("scale", data.model.scale || "0.01 0.01 0.01");
      model.setAttribute("position", "0 0 0");
      menuContainer.appendChild(model);
    }

    // 🎥 Video
    if (data.video?.src) {
      const videoEl = document.createElement("video");
      videoEl.setAttribute("id", `video-${index}`);
      videoEl.src = data.video.src;
      videoEl.setAttribute("playsinline", "");
      videoEl.setAttribute("webkit-playsinline", "");
      videoEl.loop = true;
      videoEl.muted = false; // 🔈 activable tras interacción
      videoEl.preload = "none"; // evita carga prematura
      videoEl.style.display = "none";
      document.body.appendChild(videoEl);

      const videoPlane = document.createElement("a-video");
      videoPlane.setAttribute("src", `#video-${index}`);
      videoPlane.setAttribute("width", "1.5");
      videoPlane.setAttribute("height", "0.85");
      videoPlane.setAttribute("position", "0 -0.7 0");
      menuContainer.appendChild(videoPlane);
    }

    // ❓ Trivia
    if (data.trivia?.question) {
      const triviaText = document.createElement("a-text");
      triviaText.setAttribute("value", `Trivia: ${data.trivia.question}`);
      triviaText.setAttribute("align", "center");
      triviaText.setAttribute("position", "0 -1.4 0");
      triviaText.setAttribute("color", "#FFFFFF");
      triviaText.setAttribute("width", "2");
      menuContainer.appendChild(triviaText);
    }

    targetEl.appendChild(menuContainer);
  });

  console.log("📦 Escena AR construida correctamente.");
}

// Mostrar menú y reproducir video
function showMenu(index) {
  const menu = document.querySelector(`#menu-container-${index}`);
  if (menu) menu.setAttribute("visible", "true");

  const video = document.querySelector(`#video-${index}`);
  if (video) {
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => console.warn("⚠️ No se pudo reproducir el video:", err));
    }
  }
}

// Ocultar menú y pausar video
function hideMenu(index) {
  const menu = document.querySelector(`#menu-container-${index}`);
  if (menu) menu.setAttribute("visible", "false");

  const video = document.querySelector(`#video-${index}`);
  if (video) video.pause();
}
