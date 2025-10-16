document.addEventListener("DOMContentLoaded", () => {
  const sceneEl = document.querySelector("a-scene");
  const overlay = document.getElementById("tap-to-start-overlay");
  const loader = document.getElementById("loader");
  let arData = [];

  // Esperar que A-Frame cargue
  sceneEl.addEventListener("loaded", () => {
    console.log("🎬 Escena A-Frame lista.");

    // Cargar datos AR
    fetch("./js/ar-data.json")
      .then(res => res.json())
      .then(data => {
        arData = data;
        console.log("✅ Datos AR cargados:", arData);
        buildARScene(arData);
      })
      .catch(err => console.error("❌ Error cargando AR data:", err));

    // Listeners directos sobre overlay
    overlay.addEventListener("click", startAR, { once: true });
    overlay.addEventListener("touchstart", startAR, { once: true });
  });

  function buildARScene(arData) {
    arData.forEach((data, index) => {
      const targetEl = document.createElement("a-entity");
      targetEl.setAttribute("id", `target-${index}`);
      targetEl.setAttribute("mindar-image-target", `targetIndex: ${index}`);
      sceneEl.appendChild(targetEl);

      const menuContainer = document.createElement("a-entity");
      menuContainer.setAttribute("id", `menu-container-${index}`);
      menuContainer.setAttribute("visible", "false");

      const nameText = document.createElement("a-text");
      nameText.setAttribute("value", data.targetName || `País ${index+1}`);
      nameText.setAttribute("align", "center");
      nameText.setAttribute("position", "0 0.35 0");
      nameText.setAttribute("color", "#FFD700");
      nameText.setAttribute("width", "2");
      menuContainer.appendChild(nameText);

      targetEl.appendChild(menuContainer);
    });
    console.log("📦 Escena AR construida correctamente.");
  }

  function startAR() {
    overlay.style.display = "none";
    loader.style.display = "block";

    const mindarSystem = sceneEl.systems["mindar-image"];
    if (!mindarSystem) {
      loader.innerText = "❌ MindAR no inicializado";
      return console.error("MindAR no inicializado");
    }

    mindarSystem.start()
      .then(() => {
        loader.style.display = "none";
        console.log("🚀 MindAR iniciado. Cámara activa.");
      })
      .catch(err => {
        loader.innerText = "❌ Error al iniciar MindAR";
        console.error("Error al iniciar MindAR:", err);
      });
  }
});
