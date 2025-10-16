// ar-logic.js
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Iniciando AR Mundial 2026...");

  const scene = document.querySelector("a-scene");
  const uiContainer = document.getElementById("ui-container");
  const btnModel = document.getElementById("btn-model");
  const btnVideo = document.getElementById("btn-video");
  const btnTrivia = document.getElementById("btn-trivia");

  let arData = [];

  // 🔹 Cargar datos desde el JSON
  try {
    const response = await fetch("./js/ar-data.json");
    arData = await response.json();
    console.log("✅ Datos AR cargados:", arData);
  } catch (err) {
    console.error("❌ Error cargando data.json", err);
  }

  // 🔹 Crear targets dinámicamente
  arData.forEach((item, index) => {
    const target = document.createElement("a-entity");
    target.setAttribute("mindar-image-target", `targetIndex: ${index}`);

    // Modelo 3D
    const model = document.createElement("a-gltf-model");
    model.setAttribute("src", item.model.src);
    model.setAttribute("scale", item.model.scale);
    model.setAttribute("visible", "false");
    target.appendChild(model);

    // Video
    const video = document.createElement("a-video");
    const videoId = `video-${index}`;
    video.setAttribute("id", videoId);
    video.setAttribute("src", `#${videoId}-asset`);
    video.setAttribute("width", "1.5");
    video.setAttribute("height", "0.85");
    video.setAttribute("visible", "false");
    target.appendChild(video);

    // Crear el asset <video> real (con muted y playsinline)
    const assetVideo = document.createElement("video");
    assetVideo.setAttribute("id", `${videoId}-asset`);
    assetVideo.setAttribute("src", item.video.src);
    assetVideo.setAttribute("loop", "false");
    assetVideo.setAttribute("muted", "false");
    assetVideo.setAttribute("playsinline", "true");
    assetVideo.setAttribute("webkit-playsinline", "true");
    assetVideo.preload = "auto";
    scene.appendChild(assetVideo);

    scene.appendChild(target);

    // 🔹 Eventos de detección
    target.addEventListener("targetFound", () => {
      console.log(`📸 Imagen detectada: ${item.targetName}`);
      uiContainer.style.display = "flex";

      // Asegurar que todo inicie oculto
      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");

      // Botones
      btnModel.onclick = () => {
        console.log("🧱 Mostrando modelo 3D");
        model.setAttribute("visible", "true");
        video.setAttribute("visible", "false");
        assetVideo.pause();
        assetVideo.currentTime = 0;
      };

      btnVideo.onclick = () => {
        console.log("🎥 Reproduciendo video");
        model.setAttribute("visible", "false");
        video.setAttribute("visible", "true");
        assetVideo.play().catch(err => console.warn("No se pudo reproducir video:", err));
      };

      btnTrivia.onclick = () => {
        const trivia = item.trivia;
        const userAnswer = prompt(
          `${trivia.question}\n${trivia.options
            .map((opt, i) => `${i + 1}. ${opt}`)
            .join("\n")}`
        );
        if (userAnswer - 1 === trivia.answerIndex)
          alert(trivia.feedback);
        else alert("❌ Respuesta incorrecta, intenta de nuevo.");
      };
    });

    target.addEventListener("targetLost", () => {
      console.log(`👋 Imagen perdida: ${item.targetName}`);
      uiContainer.style.display = "none";
      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");
      assetVideo.pause();
      assetVideo.currentTime = 0;
    });
  });

  console.log("📦 Escena AR lista.");
});
