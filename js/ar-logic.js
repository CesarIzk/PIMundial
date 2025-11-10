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

  /* 4️⃣ Crear entidades dinámicas */
  arData.forEach((item, i) => {
    const targetIndex = item.targetIndex ?? i;
    const target = document.createElement("a-entity");
    target.setAttribute("mindar-image-target", `targetIndex: ${targetIndex}`);

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
      infoText.setAttribute("visible", "true");

      // ✅ Restaura escala original
      model.setAttribute("scale", item.model?.scale || "1 1 1");

      // Reset de estado
      model.setAttribute("visible", "false");
      video.setAttribute("visible", "false");
      ball.setAttribute("visible", "false");
      videoAsset.pause();
      videoAsset.currentTime = 0;

      /* --- Botón Estadísticas --- */
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
        statsClose.onclick = () => statsContainer.classList.add("hidden");
      };

      /* --- Botón Modelo --- */
      btnModel.onclick = () => {
        model.setAttribute("visible", "true");

        // 🔄 Animación del modelo (si está definida)
        if (item.animation) {
          const anim = item.animation;
          model.removeAttribute("animation");
          model.setAttribute("animation", {
            property: anim.property || "rotation",
            to: anim.to || "0 360 0",
            dur: anim.speed || 3000,
            loop: anim.loop !== "false",
            easing: "easeInOutSine",
          });
        }

        // Ocultar overlay y otros elementos
        video.setAttribute("visible", "false");
        ball.setAttribute("visible", "false");
        overlayVideo.classList.remove("show");
        overlayVideo.pause();
        document.getElementById("filter-panel").classList.add("hidden");
      };


   


btnVideo.onclick = () => {
  // Ocultar elementos 3D y efectos
  model.setAttribute("visible", "false");
  video.setAttribute("visible", "false");
  ball.setAttribute("visible", "false");

  const videoSrc = item.video?.src || "";
  if (!videoSrc) {
    alert("❌ No se encontró el video para este país.");
    return;
  }

  // Detectar si es un enlace de YouTube
  const isYouTube = videoSrc.includes("youtube.com") || videoSrc.includes("youtu.be");

  const overlayIframe = document.getElementById("overlayIframe");
  const youtubeFrame = document.getElementById("youtubeFrame");
  const youtubeLink = document.getElementById("youtubeLink");

  // Ocultar ambos overlays primero
  overlayVideo.classList.add("hidden");
  overlayIframe.classList.add("hidden");

  if (isYouTube) {
    // Extraer ID del video
    const videoId = videoSrc.split("v=")[1]?.split("&")[0] || videoSrc.split("/").pop();
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;

    // Mostrar iframe
    youtubeFrame.src = embedUrl;
    youtubeLink.href = videoSrc;

    overlayIframe.classList.remove("hidden");
    overlayIframe.classList.add("show");

    // Ocultar filtros (no aplican a iframe)
    document.getElementById("filter-panel").classList.add("hidden");
    console.log("▶️ Mostrando video de YouTube:", embedUrl);
  } else {
    // Video local o remoto permitido
    overlayVideo.src = videoSrc;
    overlayVideo.classList.remove("hidden");
    overlayVideo.classList.add("show");

    overlayVideo.play().then(() => {
      console.log("🎬 Video local iniciado:", videoSrc);
    }).catch(err => console.warn("⚠️ No se pudo reproducir:", err));

    // Mostrar panel de filtros solo en videos locales
    const filterPanel = document.getElementById("filter-panel");
    filterPanel.classList.remove("hidden");

    const closeFilters = document.getElementById("close-filters");
    if (closeFilters)
      closeFilters.onclick = () => filterPanel.classList.add("hidden");

    const filterButtons = document.querySelectorAll("#filter-options button");
    filterButtons.forEach(btn => {
      btn.onclick = () => {
        const filterValue = btn.dataset.filter;
        overlayVideo.style.filter = filterValue === "none" ? "none" : filterValue;
      };
    });
  }
};




    /* --- Botón Trivia (múltiples preguntas) --- */
btnTrivia.onclick = () => {
  overlayVideo.classList.remove("show");
  overlayVideo.pause();
  document.getElementById("filter-panel").classList.add("hidden");

  const triviaSet = item.trivia;
  if (!triviaSet || !Array.isArray(triviaSet) || triviaSet.length === 0)
    return alert("❌ No hay trivia disponible.");

  const triviaContainer = document.getElementById("trivia-container");
  const triviaQuestion = document.getElementById("trivia-question");
  const triviaOptions = document.getElementById("trivia-options");
  const triviaFeedback = document.getElementById("trivia-feedback");
  const triviaClose = document.getElementById("trivia-close");

  let currentIndex = 0;
  let correctCount = 0;

  // Función para mostrar una pregunta
  const showQuestion = () => {
    const q = triviaSet[currentIndex];
    triviaQuestion.textContent = `Pregunta ${currentIndex + 1}/${triviaSet.length}: ${q.question}`;
    triviaOptions.innerHTML = "";
    triviaFeedback.textContent = "";

    q.options.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.textContent = option;
      btn.onclick = () => {
        if (index === q.answerIndex) {
          triviaFeedback.textContent = q.feedback;
          triviaFeedback.style.color = "#00ff88";
          ball.setAttribute("color", item.effects?.color || "#00ff00");
          ball.setAttribute("visible", "true");
          correctCount++;
        } else {
          triviaFeedback.textContent = "❌ Respuesta incorrecta.";
          triviaFeedback.style.color = "#ff5555";
        }

        // Mostrar siguiente pregunta o resultado
        setTimeout(() => {
          currentIndex++;
          if (currentIndex < triviaSet.length) {
            showQuestion();
          } else {
            triviaQuestion.textContent = "🎉 Resultados";
            triviaOptions.innerHTML = "";
            triviaFeedback.style.color = "#FFD700";
            triviaFeedback.textContent = `Respondiste correctamente ${correctCount} de ${triviaSet.length} preguntas.`;
          triviaFeedback.classList.add("final");

          }
        }, 1200);
      };
      triviaOptions.appendChild(btn);
    });
  };

  // Mostrar primera pregunta
  showQuestion();
  triviaContainer.classList.remove("hidden");
  triviaContainer.style.display = "block";

  triviaClose.onclick = () => {
    triviaContainer.classList.add("hidden");
    triviaContainer.style.display = "none";
    triviaFeedback.textContent = "";
  };
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
