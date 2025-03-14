document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("retro-canvas");
  const ctx = canvas.getContext("2d");
  const introVideo = document.getElementById("intro-video");
  const skipButton = document.getElementById("skip-button");

  // --- Variables para partículas ---
  let particles = [];      // Declarar antes de usarlas
  const numParticles = 20;

  // Ajustar tamaño interno del canvas y reinicializar partículas
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initParticles(); // Se inicializan las partículas después de ajustar el tamaño
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Variables para animación y parpadeo de "START"
  let showStart = true;
  let blinkTime = 0;
  const blinkInterval = 500; // milisegundos

  // Variables para zonas clicables de YES y NO
  let yesArea = { x: 0, y: 0, width: 0, height: 0 };
  let noArea = { x: 0, y: 0, width: 0, height: 0 };
  let hoveredYes = false;
  let hoveredNo = false;

  // Cargar imagen del título
  const titleImg = new Image();
  titleImg.src = "./src/logo3.png"; // Asegúrate de que el archivo existe

  // --- Funciones para partículas (simulando pociones volando) ---
  function initParticles() {
    particles = []; // Reinicializar
    const margin = 30;
    const width = canvas.width - margin * 2;
    const height = canvas.height - margin * 2;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: margin + Math.random() * width,
        y: margin + Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 3 + 2, // radio entre 2 y 5
        color: "#33ff66"  // Verde Mutante
      });
    }
  }

  function updateParticles() {
    const margin = 30;
    const width = canvas.width - margin * 2;
    const height = canvas.height - margin * 2;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      // Efecto wrap: si salen del área, reaparecen en el otro lado
      if (p.x < margin) p.x = margin + width;
      if (p.x > margin + width) p.x = margin;
      if (p.y < margin) p.y = margin + height;
      if (p.y > margin + height) p.y = margin;
    });
  }

  function drawParticles() {
    ctx.save();
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    ctx.restore();
  }

  // Función de dibujo principal
  function draw(time) {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja el marco CRT
    drawCRTFrame();

    // Dibuja fondo con cuadrícula (usando la paleta de colores)
    drawGridBackground();

    // Actualiza y dibuja partículas
    updateParticles();
    drawParticles();

    // Dibuja la interfaz de usuario (título, textos, opciones)
    drawUI();

    // Manejar parpadeo de "START"
    if (time - blinkTime > blinkInterval) {
      blinkTime = time;
      showStart = !showStart;
    }
    if (showStart) {
      drawStartText();
    }

    requestAnimationFrame(draw);
  }

  // ----- Funciones de Dibujo -----

  // 1. Marco tipo CRT con esquinas redondeadas
  function drawCRTFrame() {
    const margin = 20;
    const width = canvas.width - margin * 2;
    const height = canvas.height - margin * 2;
    const borderRadius = 20;

    ctx.save();
    ctx.strokeStyle = "#303030";
    ctx.lineWidth = 8;
    ctx.beginPath();
    roundRect(ctx, margin, margin, width, height, borderRadius);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Fondo con cuadrícula
  function drawGridBackground() {
    const margin = 30;
    const width = canvas.width - margin * 2;
    const height = canvas.height - margin * 2;
  
    ctx.save();
    // Fondo principal
    ctx.fillStyle = "#2a0134"; // Púrpura Oscuro
    ctx.fillRect(margin, margin, width, height);
  
    // Líneas de cuadrícula
    ctx.strokeStyle = "#6c1390"; // Morado Neón
    ctx.lineWidth = 2;
    const cellSize = 50;
    ctx.beginPath();
    for (let x = margin; x <= margin + width; x += cellSize) {
      ctx.moveTo(x, margin);
      ctx.lineTo(x, margin + height);
    }
    for (let y = margin; y <= margin + height; y += cellSize) {
      ctx.moveTo(margin, y);
      ctx.lineTo(margin + width, y);
    }
    ctx.stroke();
    ctx.restore();
  }  

  // 3. Dibujar la interfaz de usuario
  function drawUI() {
    ctx.save();
    // Dibujo del TÍTULO (imagen) en la parte superior
    if (titleImg.complete) {
      const desiredWidth = 400;
      const ratio = titleImg.naturalWidth / titleImg.naturalHeight;
      const calculatedHeight = desiredWidth / ratio;
      const titleX = (canvas.width - desiredWidth) / 2;
      const titleY = canvas.height * 0.1;
      ctx.drawImage(titleImg, titleX, titleY, desiredWidth, calculatedHeight);
    }
    ctx.restore();

    // "ARE YOU READY?"
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("ARE YOU READY?", canvas.width / 2, canvas.height * 0.55);
    ctx.restore();

    // Opciones interactivas "YES" y "NO"
    const optionY = canvas.height * 0.65;
    ctx.save();
    ctx.font = "24px monospace";

    // "YES"
    const yesText = "YES";
    let yesMetrics = ctx.measureText(yesText);
    const yesWidth = yesMetrics.width;
    const yesX = canvas.width / 2 - 80;
    ctx.fillStyle = hoveredYes ? "#00ccff" : "#ff8c00";
    ctx.fillText(yesText, yesX, optionY);
    yesArea.x = yesX - yesWidth / 2;
    yesArea.y = optionY - 24;
    yesArea.width = yesWidth;
    yesArea.height = 30;

    // "NO"
    const noText = "NO";
    let noMetrics = ctx.measureText(noText);
    const noWidth = noMetrics.width;
    const noX = canvas.width / 2 + 40;
    ctx.fillStyle = hoveredNo ? "#00ccff" : "#ff8c00";
    ctx.fillText(noText, noX, optionY);
    noArea.x = noX - noWidth / 2;
    noArea.y = optionY - 24;
    noArea.width = noWidth;
    noArea.height = 30;
    ctx.restore();

    // Elementos retro adicionales (HI-SCORE, corazones, etc.)
    ctx.save();
    ctx.fillStyle = "#ffdd33";
    ctx.font = "20px monospace";
    ctx.textAlign = "left";
    ctx.fillText("HI-SCORE", 50, 60);
    ctx.fillText("12300", 50, 90);
    drawHearts(3);
    ctx.restore();
  }

  // 4. Dibujar "START" (texto parpadeante)
  function drawStartText() {
    ctx.save();
    ctx.fillStyle = "#ff8c00";
    ctx.font = "48px monospace";
    ctx.textAlign = "center";
    ctx.fillText("START", canvas.width / 2, canvas.height * 0.5);
    ctx.restore();
  }

  // ----- Funciones Auxiliares -----

  function drawHearts(count) {
    const heartSpacing = 40;
    const startX = canvas.width - 50;
    const y = 60;
    for (let i = 0; i < count; i++) {
      drawHeart(startX - i * heartSpacing, y, 20, "#33ff66");
    }
  }

  function drawHeart(x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y - size / 2, x - size, y - size / 2, x - size, y);
    ctx.bezierCurveTo(x - size, y + size / 2, x, y + size, x, y + size * 1.5);
    ctx.bezierCurveTo(x, y + size, x + size, y + size / 2, x + size, y);
    ctx.bezierCurveTo(x + size, y - size / 2, x, y - size / 2, x, y);
    ctx.fill();
    ctx.restore();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  function isInside(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }

  // ----- Eventos de interactividad en "YES" y "NO" -----

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    hoveredYes = isInside(mouseX, mouseY, yesArea);
    hoveredNo = isInside(mouseX, mouseY, noArea);
  });

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (isInside(mouseX, mouseY, yesArea)) {
      console.log("Se ha seleccionado YES");
      // Acción para YES cambiar de pantalla
      window.location.href = "menu.html";
    } else if (isInside(mouseX, mouseY, noArea)) {
      console.log("Se ha seleccionado NO");
      // Acción para NO
    }
  });

  // ----- Lógica para iniciar el canvas tras finalizar o saltar el video -----

  introVideo.addEventListener("ended", () => {
    startCanvas();
  });

  skipButton.addEventListener("click", () => {
    console.log("Skip Intro clickeado");
    introVideo.pause();
    startCanvas();
  });

  function startCanvas() {
    document.getElementById("intro-video-container").style.display = "none";
    canvas.style.display = "block";
    resizeCanvas();
    requestAnimationFrame(draw);
  }
});
