document.addEventListener("DOMContentLoaded", () => {
    // Ajuste del canvas de fondo
    const canvas = document.getElementById("records-canvas");
    const ctx = canvas.getContext("2d");
    
    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    
    // Fondo animado: partículas
    let particles = [];
    const numParticles = 50;
    
    function initParticles() {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
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
      // Limpiar el canvas pero sin borrar el degradado (el degradado se establece en CSS en el background)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
    }
    
    function animateBackground() {
      updateParticles();
      drawParticles();
      requestAnimationFrame(animateBackground);
    }
    animateBackground();
    
    // Leer registros del localStorage
    const records = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Omitir claves específicas (por ejemplo, "selectedCharacter")
      if (key === "selectedCharacter") continue;
      const val = localStorage.getItem(key);
      try {
        const rec = JSON.parse(val);
        if (rec.score !== undefined) {
          records.push({ alias: key, score: rec.score, date: rec.date || "N/A" });
        }
      } catch (e) {
        if (!isNaN(val)) {
          records.push({ alias: key, score: parseInt(val), date: "N/A" });
        }
      }
    }
    
    // Ordenar registros de mayor a menor puntuación
    records.sort((a, b) => b.score - a.score);
    
    // Rellenar la tabla
    const tbody = document.querySelector("#records-table tbody");
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3">No hay registros disponibles.</td></tr>`;
    } else {
      records.forEach(record => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${record.alias}</td>
          <td>${record.score}</td>
          <td>${record.date}</td>
        `;
        tbody.appendChild(tr);
      });
    }
    
    // Animar la aparición de las filas de la tabla con GSAP
    gsap.from("#records-table tbody tr", {
      duration: 1,
      opacity: 0,
      y: 20,
      stagger: 0.1,
      ease: "power2.out"
    });
  });
  