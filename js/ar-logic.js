document.addEventListener("DOMContentLoaded", async () => {
  const scene = document.querySelector("a-scene");
  const uiContainer = document.getElementById("ui-container");
  const btnModel = document.getElementById("btn-model");
  const btnVideo = document.getElementById("btn-video");
  const btnTrivia = document.getElementById("btn-trivia");
  const loader = document.getElementById("loader");
  const overlayVideo = document.getElementById("overlayVideo"); // 🟢 Declarar aquí, al inicio

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

  /* 4️⃣ Crear entidades dinámicas */
  arData.forEach((item, i) => {
    const targetIndex = item.targetIndex ?? i;
    const target = document.createElement("a-entity");
    target.setAttribute("mindar-image-target", `targetIndex: ${targetIndex}`);

    // === Imagen informativa ===
    const infoImage = document.createElement("a-image");
    infoImage.setAttribute("src", item.infoImage || "./img/default.png");
    infoImage.setAttribute("width", "1");
    infoImage.setAttribute("height", "0.6");
    infoImage.setAttribute("position", "0 0.8 0");
    infoImage.setAttribute("visible", "false");
    target.appendChild(infoImage);

    // === Texto informativo ===
    const infoText = document.createElement("a-text");
    infoText.setAttribute("value", item.infoText || "Información del modelo");
    infoText.setAttribute("align", "center");
    infoText.setAttribute("color", "#ffffff");
    infoText.setAttribute("width", "2");
    infoText.setAttribute("position", "0 -0.8 0");
    infoText.setAttribute("visible", "false");
    target.appendChild(infoText);

    // === Modelo 3D ===
    const modelId = `model-${targetIndex}`;
    const modelAsset = document.createElement("a-asset-item");
    modelAsset.setAttribute("id", modelId);
    modelAsset.setAttribute("src", item.model?.src || "");
    assets.appendChild(modelAsset);

    const model = document.createElement("a-gltf-model");
    model.setAttribute("src", `#${modelId}`);
    model.setAttribute("scale", item.model?.scale || "1 1 1");
    model.setAttribute("visible", "false");
    target.appendChild(model);

    // === Video ===
    const videoId = `video-${targetIndex}`;
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
      console.log(`🎯 Target detectado: ${item.targetName || targetIndex}`);
      uiContainer.classList.add("show");
      uiContainer.classList.remove("hide");
      infoImage.setAttribute("visible", "true");
      infoText.setAttribute("visible", "true");

      // Reset de estado
      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");
      ball.setAttribute("visible", "false");
      videoAsset.pause();
      videoAsset.currentTime = 0;

      /* --- Botón Estadísticas --- */
const btnStats = document.getElementById("btn-stats");

btnStats.onclick = () => {
  overlayVideo.classList.remove("show");
  overlayVideo.pause();
  document.getElementById("filter-panel").classList.add("hidden");

  const stats = item.stats;
  if (!stats) return alert("❌ No hay estadísticas disponibles.");

  const statsContainer = document.getElementById("stats-container");
  const statsTitle = document.getElementById("stats-title");
  const statsList = document.getElementById("stats-list");
  const statsClose = document.getElementById("stats-close");

  statsTitle.textContent = `📊 ${item.targetName} - Estadísticas`;
  statsList.innerHTML = `
    <li><strong>Ranking FIFA:</strong> ${stats.rankingFIFA}</li>
    <li><strong>Partidos ganados:</strong> ${stats.partidosGanados}</li>
    <li><strong>Mundiales jugados:</strong> ${stats.mundialesJugados}</li>
    <li><strong>Mejor etapa:</strong> ${stats.maxEtapa}</li>
  `;

  statsContainer.classList.remove("hidden");

  statsClose.onclick = () => {
    statsContainer.classList.add("hidden");
  };
};
const btnPause = document.getElementById("btn-pause");
let isPaused = false; // Estado de animación

btnPause.onclick = () => {
  if (!item.animation) return alert("❌ Este modelo no tiene animación.");

  // Si el modelo no está visible aún, no hacemos nada
  if (model.getAttribute("visible") === "false") {
    alert("⚠️ Primero muestra el modelo 3D.");
    return;
  }

  if (!isPaused) {
    model.pause(); // pausa todas las animaciones
    btnPause.textContent = "▶️ Reanudar";
    isPaused = true;
  } else {
    model.play(); // reanuda
    btnPause.textContent = "⏸️ Pausar";
    isPaused = false;
  }
};

      /* --- Botón Modelo --- */
    btnModel.onclick = () => {
  model.setAttribute("visible", "true");

  // 🔄 Si tiene animación configurada en JSON
  if (item.animation) {
    const anim = item.animation;
    model.removeAttribute("animation");

    model.setAttribute("animation", {
      property: "rotation",
      to: "0 360 0",
      dur: anim.speed || 3000,
      loop: anim.loop !== "false",
      easing: "linear"
    });
  }

  overlayVideo.classList.remove("show");
  overlayVideo.pause();
  document.getElementById("filter-panel").classList.add("hidden");
};



      /* --- Botón Video --- */
      btnVideo.onclick = () => {
        model.setAttribute("visible", "false");
        video.setAttribute("visible", "false");
        ball.setAttribute("visible", "false");

        overlayVideo.src = item.video.src;
        overlayVideo.classList.add("show");
        overlayVideo.play();

        const filterPanel = document.getElementById("filter-panel");
        filterPanel.classList.remove("hidden");

        const closeFilters = document.getElementById("close-filters");
        if (closeFilters) {
          closeFilters.onclick = () => filterPanel.classList.add("hidden");
        }

        const filterButtons = document.querySelectorAll("#filter-options button");
        filterButtons.forEach((btn) => {
          btn.onclick = () => {
            const filterValue = btn.dataset.filter;
            overlayVideo.style.filter =
              filterValue === "none" ? "none" : filterValue;
          };
        });
      };

      /* --- Botón Trivia --- */
      btnTrivia.onclick = () => {
        overlayVideo.classList.remove("show");
        overlayVideo.pause();
        document.getElementById("filter-panel").classList.add("hidden");

        const trivia = item.trivia;
        if (!trivia) return alert("❌ No hay trivia disponible.");

        const triviaContainer = document.getElementById("trivia-container");
        const triviaQuestion = document.getElementById("trivia-question");
        const triviaOptions = document.getElementById("trivia-options");
        const triviaFeedback = document.getElementById("trivia-feedback");
        const triviaClose = document.getElementById("trivia-close");

        triviaQuestion.textContent = trivia.question;
        triviaOptions.innerHTML = "";
        triviaFeedback.textContent = "";

        trivia.options.forEach((option, index) => {
          const btn = document.createElement("button");
          btn.textContent = option;
          btn.onclick = () => {
            if (index === trivia.answerIndex) {
              triviaFeedback.textContent = trivia.feedback;
              triviaFeedback.style.color = "#00ff88";
              ball.setAttribute("color", item.effects?.color || "#00ff00");
              ball.setAttribute("visible", "true");
            } else {
              triviaFeedback.textContent = "❌ Respuesta incorrecta.";
              triviaFeedback.style.color = "#ff5555";
            }
          };
          triviaOptions.appendChild(btn);
        });

        triviaContainer.classList.remove("hidden");
        triviaClose.onclick = () => {
          triviaContainer.classList.add("hidden");
          triviaFeedback.textContent = "";
        };
      };
    });

    /* 6️⃣ Cuando se pierde el marcador */
    target.addEventListener("targetLost", () => {
      uiContainer.classList.remove("show");
      uiContainer.classList.add("hide");
      infoImage.setAttribute("visible", "false");
      infoText.setAttribute("visible", "false");
      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");
      ball.setAttribute("visible", "false");

      overlayVideo.classList.remove("show");
      overlayVideo.pause();
      document.getElementById("filter-panel").classList.add("hidden");
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
