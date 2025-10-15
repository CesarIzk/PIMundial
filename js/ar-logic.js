document.addEventListener("DOMContentLoaded", async () => {
  const sceneEl = document.querySelector("a-scene");
  const overlay = document.getElementById("tap-to-start-overlay");
  const loader = document.getElementById("loader");
  let arData = [];

  try {
    // 1️⃣ Cargar datos del archivo JSON
    const response = await fetch("./js/ar-data.json");
    arData = await response.json();
    console.log("✅ Datos AR cargados:", arData);

    // 2️⃣ Esperar que la escena A-Frame esté lista
    await new Promise(resolve => {
      if (sceneEl.hasLoaded) resolve();
      else sceneEl.addEventListener("loaded", resolve);
    });
    console.log("🎬 Escena lista.");

    // 3️⃣ Crear entidades MindAR dinámicamente
    arData.forEach((data, index) => {
      const target = document.createElement("a-entity");
      target.setAttribute("id", `target-${index}`);
      target.setAttribute("mindar-image-target", `targetIndex: ${index}`);
      sceneEl.appendChild(target);
    });

    console.log(`🧩 ${arData.length} targets creados.`);

    // 4️⃣ Construir contenido para cada target
    buildARScene(arData);

    // 5️⃣ Detectar target encontrado/perdido
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

    // 6️⃣ Interacción: iniciar cámara y MindAR solo al tocar pantalla
    overlay.addEventListener("click", async () => {
      overlay.style.display = "none";
      loader.style.display = "block";

      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("📸 Permiso de cámara otorgado.");

        const mindarSystem = sceneEl.systems["mindar-image"];
        if (!mindarSystem) throw new Error("MindAR no inicializado.");
        await mindarSystem.start();

        loader.style.display = "none";
        console.log("🚀 MindAR iniciado correctamente.");
      } catch (err) {
        loader.innerText = "❌ Error al iniciar cámara AR";
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

    // 🎥 Video (controlado manualmente)
    if (data.video?.src) {
      const videoEl = document.createElement("video");
      videoEl.setAttribute("id", `video-${index}`);
      videoEl.setAttribute("src", data.video.src);
      videoEl.setAttribute("playsinline", "");
      videoEl.setAttribute("webkit-playsinline", "");
      videoEl.muted = false;
      videoEl.loop = true;
      videoEl.preload = "auto";

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

function showMenu(index) {
  const menu = document.querySelector(`#menu-container-${index}`);
  if (menu) menu.setAttribute("visible", "true");

  const video = document.querySelector(`#video-${index}`);
  if (video) {
    video.currentTime = 0;
    video.play().catch(err => console.warn("⚠️ No se pudo reproducir el video:", err));
  }
}

function hideMenu(index) {
  const menu = document.querySelector(`#menu-container-${index}`);
  if (menu) menu.setAttribute("visible", "false");

  const video = document.querySelector(`#video-${index}`);
  if (video) video.pause();
}
