document.addEventListener("DOMContentLoaded", () => {
    // Referencias del DOM
    const canvas = document.getElementById("menu-canvas");
    const ctx = canvas.getContext("2d");
    const modeToggle = document.getElementById("mode-toggle");
    const menuItems = Array.from(document.querySelectorAll(".menu-item"));
    const menuContainer = document.getElementById("menu-container");

    // Panel lateral
    const infoPanel = document.getElementById("info-panel");
    const infoContent = document.getElementById("info-content");

    // --- Modo fullscreen / windowed ---
    let isFullscreen = true;
    modeToggle.addEventListener("click", () => {
      isFullscreen = !isFullscreen;
      if (isFullscreen) {
        menuContainer.classList.remove("windowed");
        menuContainer.classList.add("fullscreen");
        modeToggle.textContent = "Windowed Mode";
      } else {
        menuContainer.classList.remove("fullscreen");
        menuContainer.classList.add("windowed");
        modeToggle.textContent = "Fullscreen Mode";
      }
      resizeCanvas();
    });

    // Evento para ocultar el panel al hacer clic fuera de los items y del panel
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".menu-item") && !e.target.closest("#info-panel")) {
        infoPanel.classList.add("hidden");
        // Cuando se oculta el panel, agregamos la clase "centered" para centrar el overlay
        menuContainer.classList.add("centered");
      }
    });
  
    // --- Canvas Background ---
    let particles = [];
    const numParticles = 30;
  
    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  
    function initParticles() {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          radius: Math.random() * 3 + 2,
          color: "#33ff66" // Verde Mutante
        });
      }
    }
  
    function updateParticles() {
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
    }
  
    function drawBackground() {
      ctx.fillStyle = "#2a0134";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      const cellSize = 50;
      ctx.strokeStyle = "#6c1390";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();
  
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
    }
  
    function animateBackground() {
      updateParticles();
      drawBackground();
      requestAnimationFrame(animateBackground);
    }
    initParticles();
    animateBackground();
  
    // --- Navegación del Menú con teclado y mouse ---
    let selectedIndex = 0;
    function updateMenuSelection() {
      menuItems.forEach((item, index) => {
        if (index === selectedIndex) {
          item.classList.add("active");
          gsap.to(item, { scale: 1.1, duration: 0.3 });
          // Mostrar panel lateral con la info correspondiente
          showInfoPanel(item.dataset.action);
        } else {
          item.classList.remove("active");
          gsap.to(item, { scale: 1, duration: 0.3 });
        }
      });
      // Al seleccionar un item ya se mostrará el panel, removemos la clase "centered"
      menuContainer.classList.remove("centered");
    }
    updateMenuSelection();
  
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
        updateMenuSelection();
      } else if (e.key === "ArrowDown") {
        selectedIndex = (selectedIndex + 1) % menuItems.length;
        updateMenuSelection();
      } else if (e.key === "Enter") {
        const action = menuItems[selectedIndex].dataset.action;
        executeMenuAction(action);
      }
    });
  
    menuItems.forEach((item, index) => {
      item.addEventListener("mouseenter", () => {
        selectedIndex = index;
        updateMenuSelection();
      });
      item.addEventListener("click", () => {
        const action = item.dataset.action;
        executeMenuAction(action);
      });
    });
  
    function executeMenuAction(action) {
      if (action === "jugar") {
        window.location.href = "juego.html";
      }
      if (action === "records") {
        window.location.href = "records.html";
      }
      if (action === "instrucciones") {
        window.location.href = "instrucciones.html";
      }
      if (action === "creditos") {
        window.location.href = "creditos.html";
      }
    }
  
    function showInfoPanel(action) {
      // Mostramos el panel y removemos la clase "centered" para alinear el overlay a la izquierda
      infoPanel.classList.remove("hidden");
      menuContainer.classList.remove("centered");
    
      let contentHtml = "";
      switch(action) {
        case "jugar":
          contentHtml = "<h2 style='margin-bottom:10px;'>¡A jugar!</h2>" +
                        "<p>Presiona Enter para iniciar el juego.</p>";
          break;
        case "records":
          contentHtml = "<h2 style='margin-bottom:10px;'>¡¿Quien es el mejor?!</h2>" +
                        "<p>Presiona Enter para ver los mayores puntajes.</p>";
          break;
        case "instrucciones":
          contentHtml = "<h2 style='margin-bottom:10px;'>¡¿Donde Estoy?!</h2>" +
                        "<p>Presiona Enter para explicarte la dinamica.</p>";
          break;
        case "creditos":
          contentHtml = `<h2 style="margin-bottom:10px;">¡¿Quienes Somos?!</h2>
            <div class="credits">
              <div class="credits-members">
                <div class="credit-item">
                  <img src="src/team1.png" alt="Integrante 1" class="credit-photo">
                  <div class="credit-info">
                    <p class="credit-name">Luis David Flores Martínez</p>
                  </div>
                </div>
                <div class="credit-item">
                  <img src="src/team2.png" alt="Integrante 2" class="credit-photo">
                  <div class="credit-info">
                    <p class="credit-name">Sergio Emiliano Hernández Villalpando</p>
                  </div>
                </div>
                <div class="credit-item">
                  <img src="src/team3.png" alt="Integrante 3" class="credit-photo">
                  <div class="credit-info">
                    <p class="credit-name">Iván Favela Ruvalcaba</p>
                  </div>
                </div>
                <div class="credit-item">
                  <img src="src/team4.png" alt="Integrante 4" class="credit-photo">
                  <div class="credit-info">
                    <p class="credit-name">Diego Iván Salas Pedroza</p>
                  </div>
                </div>
              </div>
              <div class="credits-info">
                <p class="credit-materia">Materia: Tecnologias WEB</p>
                <p class="credit-fecha">Fecha: 15/03/2025</p>
              </div>
            </div>`;
          break;
        default:
          contentHtml = "<h2>Menú</h2><p>Selecciona una opción...</p>";
          break;
      }
    
      infoContent.innerHTML = contentHtml;
    
      // Si se muestran los creditos, ejecutamos la animación con GSAP
      if (action === "creditos") {
        gsap.from(".credits .credit-item", {
          duration: 0.8,
          x: -100,
          opacity: 0,
          stagger: 0.25,
          ease: "power2.out"
        });
        gsap.from(".credits-info", {
          duration: 1,
          y: 50,
          opacity: 0,
          ease: "power2.out",
          delay: 0.5
        });
      }
    }
});