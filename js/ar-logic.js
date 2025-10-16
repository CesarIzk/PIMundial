document.addEventListener("DOMContentLoaded", async () => {
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
    loader.innerText = "❌ Error cargando datos AR";
    console.error(err);
    return;
  }

  // Crear entidad principal para targets
  const mindar = document.createElement("a-entity");
  mindar.setAttribute("mindar-image-targets", "");
  scene.appendChild(mindar);

  // Recorremos cada target definido en el JSON
  arData.forEach((item, index) => {
    const target = document.createElement("a-entity");
    target.setAttribute("mindar-image-target", `targetIndex: ${index}`);

    // Modelo 3D
    const model = document.createElement("a-gltf-model");
    model.setAttribute("src", item.model.src);
    model.setAttribute("scale", item.model.scale);
    model.setAttribute("visible", "false");
    target.appendChild(model);

    // Crear elemento <video> real
    const realVideo = document.createElement("video");
    realVideo.src = item.video.src;
    realVideo.crossOrigin = "anonymous";
    realVideo.preload = "auto";
    realVideo.loop = false;
    realVideo.muted = true;
    realVideo.setAttribute("playsinline", "true");
    realVideo.id = `video-${index}`;
    realVideo.style.display = "none"; // oculto en el DOM
    document.body.appendChild(realVideo);

    // Agregar a <a-assets>
    let assets = document.querySelector("a-assets");
    if (!assets) {
      assets = document.createElement("a-assets");
      scene.appendChild(assets);
    }
    assets.appendChild(realVideo);

    // Crear a-video
    const video = document.createElement("a-video");
    video.setAttribute("src", `#video-${index}`);
    video.setAttribute("width", "1.5");
    video.setAttribute("height", "0.85");
    video.setAttribute("visible", "false");
    target.appendChild(video);

    mindar.appendChild(target);

    // Eventos de detección del target
    target.addEventListener("targetFound", () => {
      uiContainer.classList.add("show");
      uiContainer.classList.remove("hide");

      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");
      realVideo.pause();
      realVideo.currentTime = 0;

      btnModel.onclick = () => {
        model.setAttribute("visible", "true");
        video.setAttribute("visible", "false");
        realVideo.pause();
        realVideo.currentTime = 0;
      };

      btnVideo.onclick = () => {
        model.setAttribute("visible", "false");
        video.setAttribute("visible", "true");
        realVideo.pause();
        realVideo.currentTime = 0;
        realVideo.play();
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
      realVideo.pause();
      realVideo.currentTime = 0;
    });
  });

  // Ocultar loader cuando la cámara esté lista
  scene.addEventListener("arReady", () => loader.style.display = "none");
  scene.addEventListener("arError", (err) => console.error("Error AR:", err));
});
