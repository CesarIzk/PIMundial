document.addEventListener("DOMContentLoaded", async () => {
  const scene = document.querySelector("a-scene");
  const uiContainer = document.getElementById("ui-container");
  const btnModel = document.getElementById("btn-model");
  const btnVideo = document.getElementById("btn-video");
  const btnTrivia = document.getElementById("btn-trivia");
  const btnStats = document.getElementById("btn-stats");
  const loader = document.getElementById("loader");
  const overlayVideo = document.getElementById("overlayVideo");

  let arData = [];

  /* 1️⃣ Cargar datos AR */
  try {
    const response = await fetch("./js/ar-data.json");
    arData = await response.json();
    console.log("✅ Datos AR cargados:", arData);
  } catch (err) {
    loader.innerText = "❌ Error cargando datos AR";
    console.error(err);
    return;
  }

  /* 2️⃣ Crear contenedor de assets */
  let assets = document.querySelector("a-assets");
  if (!assets) {
    assets = document.createElement("a-assets");
    scene.appendChild(assets);
  }

  /* 3️⃣ Entidad principal MindAR */
  const mindar = document.createElement("a-entity");
  mindar.setAttribute("mindar-image-targets", "");
  scene.appendChild(mindar);

/* 4️⃣ Crear entidades dinámicas con soporte multi-target */
arData.forEach((item, i) => {
  const targetIndexes = item.targets || [item.targetIndex ?? i];

  targetIndexes.forEach((tIndex) => {
    const target = document.createElement("a-entity");
    target.setAttribute("mindar-image-target", `targetIndex: ${tIndex}`);

    // === Texto informativo ===
    const infoText = document.createElement("a-text");
    infoText.setAttribute("value", item.infoText || "");
    infoText.setAttribute("align", "center");
    infoText.setAttribute("color", "#ffffff");
    infoText.setAttribute("width", "2");
    infoText.setAttribute("position", "0 -0.8 0");
    infoText.setAttribute("visible", "false");
    target.appendChild(infoText);

    // === Modelo 3D ===
    const modelId = `model-${tIndex}`;
    const modelAsset = document.createElement("a-asset-item");
    modelAsset.setAttribute("id", modelId);
    modelAsset.setAttribute("src", item.model?.src || "");
    assets.appendChild(modelAsset);

    const model = document.createElement("a-gltf-model");
    model.setAttribute("src", `#${modelId}`);
    model.setAttribute("scale", item.model?.scale || "1 1 1");
    model.setAttribute("position", item.model?.position || "0 0 0.2");
    model.setAttribute("visible", "false");
    target.appendChild(model);

    // === Video ===
    const videoId = `video-${tIndex}`;
    const videoAsset = document.createElement("video");
    videoAsset.setAttribute("id", videoId);
    videoAsset.setAttribute("src", item.video?.src || "");
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
    video.setAttribute("position", "0 0 0.1");
    video.setAttribute("visible", "false");
    target.appendChild(video);

    // === Efecto balón ===
    const ball = document.createElement("a-sphere");
    ball.classList.add("fx-ball");
    ball.setAttribute("radius", "0.12");
    ball.setAttribute("position", "0 0.5 0");
    ball.setAttribute("visible", "false");
    target.appendChild(ball);

    mindar.appendChild(target);

    /* 5️⃣ Eventos de detección */
    target.addEventListener("targetFound", () => {
      console.log(`🎯 Target detectado: ${item.targetName} (índice ${tIndex})`);

      uiContainer.classList.add("show");
      uiContainer.classList.remove("hide");
      infoText.setAttribute("visible", "true");

      // Reset visual
      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");
      ball.setAttribute("visible", "false");
      videoAsset.pause();
      videoAsset.currentTime = 0;

      // === Botón Modelo ===
      btnModel.onclick = () => {
        model.setAttribute("visible", "true");
        model.removeAttribute("animation");
        model.removeAttribute("animation__2");

        const country = (item.targetName || "").toLowerCase();
        switch (country) {
          case "méxico":
            break;
          case "canadá":
            model.setAttribute("animation", {
              property: "position",
              dir: "alternate",
              dur: 2500,
              easing: "easeInOutSine",
              loop: true,
              to: "0 0.2 0"
            });
            break;
          case "estados unidos":
            model.setAttribute("animation", {
              property: "rotation",
              to: "0 360 0",
              dur: 3000,
              easing: "linear",
              loop: true
            });
            break;
          case "argentina":
            model.setAttribute("animation", {
              property: "position",
              dir: "alternate",
              dur: 1000,
              easing: "easeOutElastic",
              loop: true,
              to: "0 0.3 0"
            });
            break;
          case "brasil":
            model.setAttribute("animation", {
              property: "rotation",
              to: "360 360 0",
              dur: 5000,
              easing: "easeInOutQuad",
              loop: true
            });
            model.setAttribute("animation__2", {
              property: "scale",
              dir: "alternate",
              dur: 1800,
              to: "1.1 1.1 1.1",
              easing: "easeInOutSine",
              loop: true
            });
            break;
          case "francia":
            model.setAttribute("animation", {
              property: "position",
              dir: "alternate",
              dur: 400,
              easing: "easeInOutSine",
              loop: true,
              to: "0.05 0 0"
            });
            break;
          case "alemania":
            model.setAttribute("animation", {
              property: "rotation",
              to: "0 360 0",
              dur: 6000,
              loop: true,
              easing: "linear"
            });
            model.setAttribute("animation__2", {
              property: "position",
              dir: "alternate",
              to: "0.1 0.1 0",
              dur: 2500,
              easing: "easeInOutSine",
              loop: true
            });
            break;
          case "japón":
            model.setAttribute("animation", {
              property: "scale",
              dir: "alternate",
              dur: 1000,
              loop: true,
              easing: "easeInOutSine",
              to: "1.2 1.2 1.2"
            });
            break;
          default:
            model.setAttribute("animation", {
              property: "rotation",
              to: "0 360 0",
              dur: 4000,
              easing: "linear",
              loop: true
            });
            break;
        }
      };

      // === Botón Video ===
      btnVideo.onclick = () => {
        overlayVideo.src = item.video?.src || "";
        overlayVideo.classList.add("show");
        overlayVideo.play().catch(() => {});
        overlayVideo.style.pointerEvents = "none";
        uiContainer.style.pointerEvents = "auto";
      };

      // === Botón Trivia ===
      btnTrivia.onclick = () => {
        const triviaSet = item.trivia || [];
        if (!triviaSet.length) return alert("❌ No hay trivia disponible.");

        const triviaContainer = document.getElementById("trivia-container");
        const triviaQuestion = document.getElementById("trivia-question");
        const triviaOptions = document.getElementById("trivia-options");
        const triviaFeedback = document.getElementById("trivia-feedback");
        const triviaClose = document.getElementById("trivia-close");

        let currentIndex = 0;
        let correctCount = 0;

        const showQuestion = () => {
          const q = triviaSet[currentIndex];
          triviaQuestion.textContent = q.question;
          triviaOptions.innerHTML = "";
          triviaFeedback.textContent = "";

          q.options.forEach((opt, idx) => {
            const b = document.createElement("button");
            b.textContent = opt;
            b.onclick = () => {
              if (idx === q.answerIndex) {
                triviaFeedback.textContent = q.feedback;
                triviaFeedback.style.color = "#00ff88";
                correctCount++;
              } else {
                triviaFeedback.textContent = "❌ Respuesta incorrecta.";
                triviaFeedback.style.color = "#ff5555";
              }
              setTimeout(() => {
                currentIndex++;
                if (currentIndex < triviaSet.length) {
                  showQuestion();
                } else {
                  triviaQuestion.textContent = "🎉 Resultados";
                  triviaFeedback.style.color = "#FFD700";
                  triviaFeedback.textContent = `Acertaste ${correctCount} de ${triviaSet.length}.`;
                  triviaOptions.innerHTML = "";
                }
              }, 1200);
            };
            triviaOptions.appendChild(b);
          });
        };

        showQuestion();
        triviaContainer.classList.remove("hidden");
        triviaClose.onclick = () => triviaContainer.classList.add("hidden");
      };
    });

    /* 6️⃣ Cuando se pierde el marcador */
    target.addEventListener("targetLost", () => {
      uiContainer.classList.remove("show");
      uiContainer.classList.add("hide");
      infoText.setAttribute("visible", "false");
      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");
      ball.setAttribute("visible", "false");
      model.removeAttribute("animation");
      model.removeAttribute("animation__2");
      overlayVideo.classList.remove("show");
      overlayVideo.pause();
    });
  });
});

  /* 7️⃣ Estado global AR */
  scene.addEventListener("arReady", () => {
    loader.style.display = "none";
    console.log("🟢 AR lista.");
  });
  scene.addEventListener("arError", (err) => {
    console.error("❌ Error AR:", err);
    loader.innerText = "Error al iniciar AR.";
  });
});
