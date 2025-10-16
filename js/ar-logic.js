// js/ar-logic.js
document.addEventListener("DOMContentLoaded", () => {
  const sceneEl = document.querySelector("#ar-scene");
  const loader = document.getElementById("loader");
  let arData = [];

  // -------------------------
  // Helper utilities
  // -------------------------
  const createEl = (tag, attrs = {}) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };

  const safeQuery = (selector) => document.querySelector(selector);

  // -------------------------
  // Load JSON and build scene
  // -------------------------
  fetch("./js/ar-data.json")
    .then(r => r.json())
    .then(data => {
      arData = data;
      console.log("✅ Datos AR cargados:", arData);
      buildARScene(arData);
    })
    .catch(err => {
      console.error("❌ Error cargando ar-data.json:", err);
      loader.innerText = "Error cargando datos";
    });

  // When MindAR/scene is ready hide loader (autoStart=true handles camera)
  sceneEl.addEventListener("arReady", () => {
    loader.style.display = "none";
    console.log("🚀 MindAR listo / cámara activa");
  });
  sceneEl.addEventListener("arError", (err) => {
    loader.innerText = "❌ Error inicializando AR";
    console.error("arError:", err);
  });

  // -------------------------
  // Build content per target
  // -------------------------
  function buildARScene(dataArray) {
    dataArray.forEach((data, index) => {
      // 1) Create target parent (mindar-image-target)
      const target = createEl("a-entity", { "mindar-image-target": `targetIndex: ${index}` });
      target.setAttribute("id", `target-${index}`);
      sceneEl.appendChild(target);

      // 2) Content container (hidden by default)
      const container = createEl("a-entity", { id: `content-${index}`, visible: "false", position: "0 0 0" });
      target.appendChild(container);

      // 3) Decorative name text
      const title = createEl("a-text", {
        value: data.targetName || `País ${index+1}`,
        align: "center",
        color: "#FFD700",
        width: "2",
        position: "0 0.45 0"
      });
      container.appendChild(title);

      // 4) Model (if present)
      let modelEl = null;
      if (data.model?.src) {
        modelEl = createEl("a-gltf-model", {
          src: data.model.src,
          scale: data.model.scale || "0.02 0.02 0.02",
          position: "0 -0.1 0",
          rotation: "0 180 0"
        });
        // give it a gentle rotation animation (loop)
        modelEl.setAttribute("animation__rot", "property: rotation; to: 0 540 0; dur: 12000; easing: linear; loop: true");
        container.appendChild(modelEl);
      }

      // 5) Video (if present) -> create <video> element in DOM and a-video plane in AR
      let videoEl = null;
      if (data.video?.src) {
        videoEl = document.createElement("video");
        videoEl.setAttribute("id", `video-${index}`);
        videoEl.src = data.video.src;
        videoEl.setAttribute("playsinline", "");
        videoEl.setAttribute("webkit-playsinline", "");
        videoEl.muted = true;          // muted to allow autoplay on many devices
        videoEl.loop = true;
        videoEl.preload = "auto";
        videoEl.style.display = "none"; // hide native element
        document.body.appendChild(videoEl);

        const aVideo = createEl("a-video", {
          src: `#video-${index}`,
          width: "1.4",
          height: "0.8",
          position: "0 0.1 0.01"
        });
        // start hidden; when content container visible we'll play video
        aVideo.setAttribute("visible", "true");
        container.appendChild(aVideo);
      }

      // 6) Stats panel (hidden, filled on demand)
      const statsPanel = createEl("a-entity", { id: `stats-${index}`, visible: "false", position: "0 -0.85 0" });
      // background plane
      const statsBg = createEl("a-plane", { width: "1.6", height: "0.5", color: "#0a192f", opacity: "0.9", position: "0 0 0" });
      statsPanel.appendChild(statsBg);
      // placeholder text
      const statsText = createEl("a-text", { id: `stats-text-${index}`, value: "Cargando estadísticas...", align: "left", width: "1.4", position: "-0.7 0.12 0.01", color: "#fff" });
      statsPanel.appendChild(statsText);
      container.appendChild(statsPanel);

      // 7) Trivia panel (hidden)
      const triviaPanel = createEl("a-entity", { id: `trivia-${index}`, visible: "false", position: "0 -0.2 0" });
      container.appendChild(triviaPanel);

      // 8) Celebration helper (light + simple scaling animation)
      const celebrationLight = createEl("a-light", { id: `light-${index}`, type: "point", intensity: "0", distance: "4", color: "#ffd700", position: "0 0.5 0" });
      container.appendChild(celebrationLight);

      // 9) Build the interaction menu (buttons)
      const menu = createEl("a-entity", { id: `menu-${index}`, position: "0 -0.45 0" });
      // Button helper factory
      const makeButton = (label, y, color="#0A84FF") => {
        const btn = createEl("a-plane", {
          width: "0.9",
          height: "0.22",
          color,
          class: "clickable",
          position: `0 ${y} 0.01`
        });
        const txt = createEl("a-text", { value: label, align: "center", width: "0.8", color: "#fff", position: "0 0 0.01" });
        btn.appendChild(txt);
        return btn;
      };

      // Buttons: Model, Video, Stats, Trivia, Celebrate
      const bModel = makeButton("Ver Modelo", 0.3);
      const bVideo = makeButton("Reproducir Video", 0);
      const bStats = makeButton("Estadísticas", -0.3);
      const bTrivia = makeButton("Trivia", -0.6);
      const bCelebrate = makeButton("Celebrar!", -0.9, "#E31B23");

      menu.appendChild(bModel);
      menu.appendChild(bVideo);
      menu.appendChild(bStats);
      menu.appendChild(bTrivia);
      menu.appendChild(bCelebrate);
      container.appendChild(menu);

      // 10) Button event handlers
      bModel.addEventListener("click", () => {
        // Show model, hide other panels
        if (modelEl) {
          modelEl.setAttribute("visible", "true");
          // optionally scale/animate
          modelEl.emit && modelEl.emit("play"); // noop if no listener
        }
        if (videoEl) videoEl.pause();
        statsPanel.setAttribute("visible", "false");
        triviaPanel.setAttribute("visible", "false");
      });

      bVideo.addEventListener("click", () => {
        // Show video plane and play
        if (videoEl) {
          // pause other videos
          document.querySelectorAll("video").forEach(v=>{ if(v!==videoEl) v.pause(); });
          videoEl.currentTime = 0;
          videoEl.play().catch(e => console.warn("Video play blocked:", e));
        }
        statsPanel.setAttribute("visible", "false");
        triviaPanel.setAttribute("visible", "false");
      });

      bStats.addEventListener("click", () => {
        // Populate simulated statistics and show panel
        const stats = {
          possession: `${Math.floor(40 + Math.random()*40)}%`,
          shots: `${Math.floor(3 + Math.random()*10)}`,
          goals: `${Math.floor(Math.random()*5)}`,
          fouls: `${Math.floor(Math.random()*10)}`
        };
        const text = `Posesión: ${stats.possession}\nDisparos: ${stats.shots}\nGoles: ${stats.goals}\nFaltas: ${stats.fouls}`;
        statsText.setAttribute("value", text);
        statsPanel.setAttribute("visible", "true");
        // hide others
        triviaPanel.setAttribute("visible", "false");
      });

      bTrivia.addEventListener("click", () => {
        buildTrivia(index, data.trivia, triviaPanel);
        triviaPanel.setAttribute("visible", "true");
        statsPanel.setAttribute("visible", "false");
      });

      bCelebrate.addEventListener("click", () => {
        triggerCelebration(container, celebrationLight, modelEl);
      });

      // 11) Target found / lost: show main container
      target.addEventListener("targetFound", () => {
        console.log(`Target '${data.targetName}' FOUND`);
        container.setAttribute("visible", "true");
        // Optionally auto-show model by default
        if (modelEl) modelEl.setAttribute("visible", "true");
      });

      target.addEventListener("targetLost", () => {
        console.log(`Target '${data.targetName}' LOST`);
        container.setAttribute("visible", "false");
        // Pause video if playing
        if (videoEl && !videoEl.paused) videoEl.pause();
        // hide panels
        statsPanel.setAttribute("visible", "false");
        triviaPanel.setAttribute("visible", "false");
      });
    });

    console.log("📦 Todas las entidades AR han sido creadas.");
  }

  // -------------------------
  // Trivia builder
  // -------------------------
  function buildTrivia(index, triviaObj, container) {
    container.innerHTML = ""; // clear
    if (!triviaObj) {
      const t = createEl("a-text", { value: "No hay trivia disponible.", align: "center", color:"#fff", width:"1.6"});
      container.appendChild(t);
      return;
    }

    const q = createEl("a-text", { value: triviaObj.question, align: "center", color: "#FFD", width: "1.6", position: "0 0.22 0" });
    container.appendChild(q);

    triviaObj.options.forEach((opt, i) => {
      const option = createEl("a-plane", { width: "1.4", height: "0.18", color: "#006847", position: `0 ${0.05 - i*0.25} 0.01`, class: "clickable" });
      const txt = createEl("a-text", { value: opt, align: "center", width: "1.2", color: "#fff", position: "0 0 0.01" });
      option.appendChild(txt);
      option.addEventListener("click", () => {
        // Feedback
        container.innerHTML = "";
        const correct = (i === triviaObj.answerIndex);
        const feedback = correct ? (triviaObj.feedback || "¡Correcto!") : "Incorrecto, intenta de nuevo";
        const fb = createEl("a-text", { value: feedback, align: "center", color: correct ? "#00FF00" : "#FF3333", width: "1.6" });
        container.appendChild(fb);
      });
      container.appendChild(option);
    });
  }

  // -------------------------
  // Celebration effect
  // -------------------------
  function triggerCelebration(container, lightEl, modelEl) {
    // Light flash
    lightEl.setAttribute("intensity", "4");
    setTimeout(()=> lightEl.setAttribute("intensity", "0"), 600);

    // Model "pop" animation
    if (modelEl) {
      modelEl.setAttribute("animation__pop", "property: scale; to: 0.04 0.04 0.04; dur: 200; dir: alternate; loop: 2");
      // also a brief rotation
      modelEl.setAttribute("animation__spin", "property: rotation; to: 0 720 0; dur: 800; easing: easeOutQuad");
      setTimeout(()=> {
        // cleanup animations
        modelEl.removeAttribute("animation__pop");
        modelEl.removeAttribute("animation__spin");
      }, 1000);
    }

    // Optional: floating confetti-like squares (simple approach)
    for (let i=0;i<8;i++) {
      const conf = createEl("a-box", {
        width: "0.03", height: "0.03", depth: "0.01",
        color: ["#FFD700","#E31B23","#00AEEF","#00FFAA"][i%4],
      });
      conf.setAttribute("position", `${(Math.random()-0.5).toFixed(2)} 0.1 ${(-0.1 - Math.random()*0.2).toFixed(2)}`);
      conf.setAttribute("animation__rise", `property: position; to: ${ (Math.random()-0.5).toFixed(2) } 0.9 ${(-0.2 - Math.random()*0.2).toFixed(2)}; dur: ${700 + Math.random()*600}; easing: easeOutCubic`);
      conf.setAttribute("animation__fade", `property: opacity; to: 0; dur: 800; delay: 400`);
      container.appendChild(conf);
      // cleanup after animation
      setTimeout(()=> { try{ container.removeChild(conf);}catch(e){} }, 1600);
    }
  }

});
