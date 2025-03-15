document.addEventListener("DOMContentLoaded", () => {
  // Animar la entrada del contenido Game Over
  gsap.from("#gameover-content", { duration: 1.2, opacity: 0, y: -50, ease: "power2.out" });

  // Botón para regresar al menú principal
  const returnBtn = document.getElementById("return-menu-btn");
  returnBtn.addEventListener("click", () => {
    gsap.to("#gameover-content", {
      duration: 0.8,
      opacity: 0,
      y: 50,
      ease: "power2.in",
      onComplete: () => {
        window.location.href = "menu.html";
      }
    });
  });

  // Fondo animado: Partículas sutiles
  const canvas = document.getElementById("gameover-canvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  let particles = [];
  const numParticles = 30;

  function initParticles() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: "#33ff66" // Verde Mutante
      });
    }
  }
  initParticles();

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

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
  }

  function animateParticles() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // Mostrar el puntaje obtenido desde localStorage con la key "selectedPlayer"
  const scoreDisplay = document.getElementById("score-display");
  let score = 0;
  const selectedPlayer = localStorage.getItem("selectedPlayer");
  if (selectedPlayer) {
    try {
        const data = JSON.parse(selectedPlayer);
        score = data.score;
    } catch (e) {
        score = 0;
    }
  }
  scoreDisplay.textContent = `Tu Puntaje: ${score}`;
});