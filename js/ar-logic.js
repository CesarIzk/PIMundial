// ar-logic.js
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Iniciando AR Mundial 2026...");

  const scene = document.querySelector("a-scene");
  const uiContainer = document.getElementById("ui-container");
  const btnModel = document.getElementById("btn-model");
  const btnVideo = document.getElementById("btn-video");
  const btnTrivia = document.getElementById("btn-trivia");

  let arData = [];

  // Cargar datos desde el JSON
  try {
    const response = await fetch("./js/ar-data.json");
    arData = await response.json();
    console.log("✅ Datos AR cargados:", arData);
  } catch (err) {
    console.error("❌ Error cargando data.json", err);
  }

  // Crear targets dinámicamente
  const mindar = document.createElement("a-entity");
  mindar.setAttribute("mindar-image-targets", "");
  scene.appendChild(mindar);

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
    video.setAttribute("src", item.video.src);
    video.setAttribute("width", "1.5");
    video.setAttribute("height", "0.85");
    video.setAttribute("visible", "false");
    target.appendChild(video);

    mindar.appendChild(target);

    // Eventos de detección
    target.addEventListener("targetFound", () => {
      console.log(`📸 Imagen detectada: ${item.targetName}`);
      uiContainer.style.display = "flex";

      // Ocultar todos los assets al inicio
      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");

      // Botones interactivos
      btnModel.onclick = () => {
        model.setAttribute("visible", "true");
        video.setAttribute("visible", "false");
      };

      btnVideo.onclick = () => {
        video.setAttribute("visible", "true");
        model.setAttribute("visible", "false");
        const vidEl = video.querySelector("video");
        if (vidEl) vidEl.play();
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
    });
  });

  console.log("📦 Escena AR lista.");
});
