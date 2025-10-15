document.addEventListener("DOMContentLoaded", async () => {
  const sceneEl = document.querySelector("a-scene");
  let arData = [];

  try {
    // 1️⃣ Cargar datos desde el archivo JSON
    const response = await fetch("./js/ar-data.json");
    arData = await response.json();
    console.log("✅ Datos de AR cargados:", arData);

    // 2️⃣ Esperar a que la escena esté lista
    await new Promise(resolve => {
      if (sceneEl.hasLoaded) resolve();
      else sceneEl.addEventListener("loaded", resolve);
    });
    console.log("🎬 Escena A-Frame lista.");

    // 3️⃣ Crear dinámicamente los targets
    arData.forEach((data, index) => {
      const target = document.createElement("a-entity");
      target.setAttribute("id", `target-${index}`);
      target.setAttribute("mindar-image-target", `targetIndex: ${index}`);
      sceneEl.appendChild(target);
    });
    console.log(`🧩 ${arData.length} targets creados en la escena.`);

    // 4️⃣ Crear el contenido para cada target
    buildARScene(arData);

    // 5️⃣ Agregar detección de cada target
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

    // 6️⃣ Pedir permiso de cámara y esperar interacción del usuario
    const overlay = document.getElementById("tap-to-start-overlay");
    const loader = document.getElementById("loader");
    const mindarSystem = sceneEl.systems["mindar-image"];

    overlay.addEventListener("click", async () => {
      overlay.style.display = "none";
      loader.style.display = "block";

      try {
        // Pedir permiso de cámara antes de iniciar
        await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("📸 Permiso de cámara otorgado.");

        // Esperar que el sistema MindAR esté listo
        if (!mindarSystem) throw new Error("MindAR no está inicializado.");
        await mindarSystem.start();

        loader.style.display = "none";
        console.log("🚀 MindAR iniciado y cámara activa.");
      } catch (err) {
        loader.innerText = "❌ Error al iniciar cámara AR";
        console.error("Error al iniciar MindAR:", err);
      }
    });

  } catch (error) {
    console.error("❌ Error al inicializar el sistema AR:", error);
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

    // Contenedor principal de menú
    const menuContainer = document.createElement("a-entity");
    menuContainer.setAttribute("id", `menu-container-${index}`);
    menuContainer.setAttribute("visible", "false");
    menuContainer.setAttribute("position", "0 0 0");

    // Texto con el nombre del país
    const nameText = document.createElement("a-text");
    nameText.setAttribute("value", data.targetName || `País ${index + 1}`);
    nameText.setAttribute("align", "center");
    nameText.setAttribute("position", "0 0.35 0");
    nameText.setAttribute("color", "#FFD700");
    nameText.setAttribute("width", "2");
    menuContainer.appendChild(nameText);

    // Modelo 3D
    if (data.model && data.model.src) {
      const model = document.createElement("a-gltf-model");
      model.setAttribute("src", data.model.src);
      model.setAttribute("scale", data.model.scale || "0.01 0.01 0.01");
      model.setAttribute("position", "0 0 0");
      menuContainer.appendChild(model);
    }

    // Video
    if (data.video && data.video.src) {
      const videoPlane = document.createElement("a-video");
      videoPlane.setAttribute("src", data.video.src);
      videoPlane.setAttribute("width", "1.5");
      videoPlane.setAttribute("height", "0.85");
      videoPlane.setAttribute("position", "0 -0.7 0");
      videoPlane.setAttribute("autoplay", "false");
      videoPlane.setAttribute("loop", "true");
      menuContainer.appendChild(videoPlane);
    }

    // Trivia (solo texto por ahora)
    if (data.trivia && data.trivia.question) {
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

  console.log("📦 Contenido AR generado para todos los targets.");
}

// Mostrar menú del país detectado
function showMenu(index) {
  const menu = document.querySelector(`#menu-container-${index}`);
  if (menu) menu.setAttribute("visible", "true");

  // 🎥 Reproducir video al detectar target
  const video = menu?.querySelector("video");
  if (video) video.play().catch(() => console.warn("⚠️ No se pudo reproducir video aún."));
}

// Ocultar menú al perder el target
function hideMenu(index) {
  const menu = document.querySelector(`#menu-container-${index}`);
  if (menu) menu.setAttribute("visible", "false");

  // ⏸️ Pausar video al perder el target
  const video = menu?.querySelector("video");
  if (video) video.pause();
}
