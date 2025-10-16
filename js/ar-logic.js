document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Iniciando AR Mundial 2026...");

  const scene = document.querySelector("a-scene");
  const uiContainer = document.getElementById("ui-container");
  const btnModel = document.getElementById("btn-model");
  const btnVideo = document.getElementById("btn-video");
  const btnTrivia = document.getElementById("btn-trivia");
  const loader = document.getElementById("loader");

  let arData = [];

  // Cargar datos desde JSON
  try {
    const response = await fetch("./js/ar-data.json");
    arData = await response.json();
    console.log("✅ Datos AR cargados:", arData);
  } catch (err) {
    console.error("❌ Error cargando ar-data.json", err);
    loader.innerText = "❌ Error cargando datos AR";
    return;
  }

  // Crear entidad principal para targets
  const mindar = document.createElement("a-entity");
  mindar.setAttribute("mindar-image-targets", "");
  scene.appendChild(mindar);

  // Iterar sobre cada target
  arData.forEach((item, index) => {
    const target = document.createElement("a-entity");
    target.setAttribute("mindar-image-target", `targetIndex: ${index}`);
    
    // Modelo 3D
    const model = document.createElement("a-gltf-model");
    model.setAttribute("src", `#model${index}`);
    model.setAttribute("scale", item.model.scale);
    model.setAttribute("visible", "false");
    target.appendChild(model);

    // Video
    const video = document.createElement("a-video");
    video.setAttribute("src", `#video${index}`);
    video.setAttribute("width", "1.5");
    video.setAttribute("height", "0.85");
    video.setAttribute("visible", "false");
    target.appendChild(video);

    mindar.appendChild(target);

    // Elemento <video> real
    const vidEl = video.querySelector("video");

    target.addEventListener("targetFound", () => {
      console.log(`📸 Imagen detectada: ${item.targetName}`);
      uiContainer.classList.add("show");
      uiContainer.classList.remove("hide");

      // Ocultar al inicio
      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");
      if (vidEl) {
        vidEl.pause();
        vidEl.currentTime = 0;
      }

      btnModel.onclick = () => {
        model.setAttribute("visible", "true");
        video.setAttribute("visible", "false");
        if (vidEl) vidEl.pause();
        vidEl.currentTime = 0;
      };

      btnVideo.onclick = () => {
        model.setAttribute("visible", "false");
        video.setAttribute("visible", "true");
        if (vidEl) {
          vidEl.pause();
          vidEl.currentTime = 0;
          vidEl.play();
        }
      };

      btnTrivia.onclick = () => {
        const trivia = item.trivia;
        const userAnswer = prompt(
          `${trivia.question}\n${trivia.options.map((opt,i)=>`${i+1}. ${opt}`).join("\n")}`
        );
        if (userAnswer-1 === trivia.answerIndex) alert(trivia.feedback);
        else alert("❌ Respuesta incorrecta, intenta de nuevo.");
      };
    });

    target.addEventListener("targetLost", () => {
      console.log(`👋 Imagen perdida: ${item.targetName}`);
      uiContainer.classList.remove("show");
      uiContainer.classList.add("hide");

      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");
      if (vidEl) {
        vidEl.pause();
        vidEl.currentTime = 0;
      }
    });
  });

  scene.addEventListener("arReady", () => {
    loader.style.display = "none";
    console.log("🚀 MindAR listo. Cámara activa.");
  });

  scene.addEventListener("arError", (err) => {
    loader.innerText = "❌ Error al iniciar AR";
    console.error("Error al iniciar AR:", err);
  });

  console.log("📦 Escena AR lista.");
});
