document.addEventListener("DOMContentLoaded", () => {
    // Animar la entrada del contenido con GSAP
    gsap.from("#felicitacion-content", { duration: 1.2, opacity: 0, y: -50, ease: "power2.out" });
  
    // Obtener alias y puntaje del ganador desde localStorage
    const congratsTitle = document.getElementById("congrats-title");
    const congratsMessage = document.getElementById("congrats-message");
    const alias = localStorage.getItem("selectedAlias") || "Jugador";
    let score = 0;
    const record = localStorage.getItem(alias);
    if (record) {
      try {
        const data = JSON.parse(record);
        score = data.score || 0;
      } catch (e) {
        score = parseInt(record) || 0;
      }
    }
    congratsTitle.textContent = `¡Felicidades, ${alias}!`;
    congratsMessage.textContent = `Has ganado la partida con un puntaje de ${score}. ¡Eres un verdadero campeón!`;
  
    // Botón para regresar al menú principal
    const returnBtn = document.getElementById("return-menu-btn");
    returnBtn.addEventListener("click", () => {
      gsap.to("#felicitacion-content", {
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
    const canvas = document.getElementById("felicitacion-canvas");
    const ctx = canvas.getContext("2d");
  
    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  
    let particles = [];
    const numParticles = 50;
    
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
  });
  