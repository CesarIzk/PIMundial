document.addEventListener("DOMContentLoaded", async () => {
  const scene = document.querySelector("a-scene");
  const uiContainer = document.getElementById("ui-container");
  const btnModel = document.getElementById("btn-model");
  const btnVideo = document.getElementById("btn-video");
  const btnTrivia = document.getElementById("btn-trivia");
  const loader = document.getElementById("loader");

  let arData = [];

  // Cargar JSON
  try {
    const response = await fetch("./js/ar-data.json");
    arData = await response.json();
    console.log("✅ Datos AR cargados:", arData);
  } catch (err) {
    loader.innerText = "❌ Error cargando datos AR";
    console.error(err);
    return;
  }

  // Crear <a-assets> si no existe
  let assets = document.querySelector("a-assets");
  if (!assets) {
    assets = document.createElement("a-assets");
    scene.appendChild(assets);
  }

  // Entidad principal para targets
  const mindar = document.createElement("a-entity");
  mindar.setAttribute("mindar-image-targets", "");
  scene.appendChild(mindar);

  arData.forEach((item, index) => {
    const target = document.createElement("a-entity");
    target.setAttribute("mindar-image-target", `targetIndex: ${index}`);

    // --- Modelos ---
    const modelId = `model-${index}`;
    const modelAsset = document.createElement("a-asset-item");
    modelAsset.setAttribute("id", modelId);
    modelAsset.setAttribute("src", item.model.src);
    assets.appendChild(modelAsset);

    const model = document.createElement("a-gltf-model");
    model.setAttribute("src", `#${modelId}`);
    model.setAttribute("scale", item.model.scale);
    model.setAttribute("visible", "false");
    target.appendChild(model);

    // --- Videos ---
    const videoId = `video-${index}`;
    const videoAsset = document.createElement("video");
    videoAsset.setAttribute("id", videoId);
    videoAsset.setAttribute("src", item.video.src);
    videoAsset.setAttribute("crossorigin", "anonymous");
    videoAsset.setAttribute("preload", "auto");
    videoAsset.setAttribute("playsinline", "true");
    videoAsset.setAttribute("muted", "true");
    videoAsset.style.display = "none";
    assets.appendChild(videoAsset);

    const video = document.createElement("a-video");
    video.setAttribute("src", `#${videoId}`);
    video.setAttribute("width", "1.5");
    video.setAttribute("height", "0.85");
    video.setAttribute("visible", "false");
    target.appendChild(video);

    mindar.appendChild(target);

    // Obtener elemento <video> real
    const vidEl = videoAsset;

    // --- Eventos ---
    target.addEventListener("targetFound", () => {
      uiContainer.classList.add("show");
      uiContainer.classList.remove("hide");

      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");
      vidEl.pause();
      vidEl.currentTime = 0;

      btnModel.onclick = () => {
        model.setAttribute("visible", "true");
        video.setAttribute("visible", "false");
        vidEl.pause();
        vidEl.currentTime = 0;
      };

      btnVideo.onclick = () => {
        model.setAttribute("visible", "false");
        video.setAttribute("visible", "true");
        vidEl.pause();
        vidEl.currentTime = 0;
        vidEl.play();
      };

      btnTrivia.onclick = () => {
        const trivia = item.trivia;
        const userAnswer = prompt(
          `${trivia.question}\n${trivia.options.map((o,i)=>`${i+1}. ${o}`).join("\n")}`
        );
        if (userAnswer-1 === trivia.answerIndex) alert(trivia.feedback);
        else alert("❌ Respuesta incorrecta");
      };
    });

    target.addEventListener("targetLost", () => {
      uiContainer.classList.remove("show");
      uiContainer.classList.add("hide");
      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");
      vidEl.pause();
      vidEl.currentTime = 0;
    });
  });

  // Loader
  scene.addEventListener("arReady", () => loader.style.display = "none");
  scene.addEventListener("arError", (err) => console.error("Error AR:", err));
});
