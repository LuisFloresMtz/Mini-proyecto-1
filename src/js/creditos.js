document.addEventListener("DOMContentLoaded", () => {
  try {
    const container = document.getElementById("credits-container");
    const subjects = Array.from(document.querySelectorAll(".draggable"));
    const dropZones = Array.from(document.querySelectorAll(".drop-zone"));
    const returnBtn = document.getElementById("return-menu-btn");

    if (!container) throw new Error("No se encontró #credits-container");
    if (!returnBtn) throw new Error("No se encontró #return-menu-btn");

    // Botón de retorno
    returnBtn.addEventListener("click", () => {
      gsap.to("#credits-container", {
        duration: 0.8,
        opacity: 0,
        onComplete: () => (window.location.href = "menu.html")
      });
    });

    // Canvas para fondo animado
    const canvas = document.getElementById("credits-canvas");
    if (!canvas) throw new Error("No se encontró #credits-canvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Inicializar partículas
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
          color: "#33ff66"
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

    // Inicializar posición y velocidad para cada sujeto draggable
    subjects.forEach(subject => {
      subject.pos = {
        x: Math.random() * (container.clientWidth - subject.clientWidth),
        y: Math.random() * (container.clientHeight - subject.clientHeight)
      };
      subject.vel = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      };
      subject.dragging = false;
      subject.style.left = `${subject.pos.x}px`;
      subject.style.top = `${subject.pos.y}px`;
      subject.addEventListener("pointerdown", onPointerDown);
    });

    function onPointerDown(e) {
      const subject = e.currentTarget;
      if (!subject) return;
      subject.dragging = true;
      subject.style.cursor = "grabbing";
      subject.setPointerCapture(e.pointerId);
      subject.startX = e.clientX;
      subject.startY = e.clientY;
      subject.initialPos = { x: subject.pos.x, y: subject.pos.y };
      subject.addEventListener("pointermove", onPointerMove);
      subject.addEventListener("pointerup", onPointerUp);
    }

    function onPointerMove(e) {
      const subject = e.currentTarget;
      if (!subject) return;
      const dx = e.clientX - subject.startX;
      const dy = e.clientY - subject.startY;
      subject.pos.x = subject.initialPos.x + dx;
      subject.pos.y = subject.initialPos.y + dy;
      subject.style.left = `${subject.pos.x}px`;
      subject.style.top = `${subject.pos.y}px`;
    }

    function onPointerUp(e) {
      const subject = e.currentTarget;
      if (!subject) return;
      subject.dragging = false;
      subject.style.cursor = "grab";
      subject.removeEventListener("pointermove", onPointerMove);
      subject.removeEventListener("pointerup", onPointerUp);
      
      const subjectRect = subject.getBoundingClientRect();
      dropZones.forEach(zone => {
        if (!zone) return;
        const zoneRect = zone.getBoundingClientRect();
        if (
          subjectRect.left + subjectRect.width / 2 > zoneRect.left &&
          subjectRect.left + subjectRect.width / 2 < zoneRect.right &&
          subjectRect.top + subjectRect.height / 2 > zoneRect.top &&
          subjectRect.top + subjectRect.height / 2 < zoneRect.bottom
        ) {
          // Asegurarse de que ambos datasets existan
          if (subject.dataset && zone.dataset && subject.dataset.id === zone.dataset.target) {
            zone.classList.remove("incorrect");
            zone.classList.add("correct");
            gsap.to(subject, {
              left: zoneRect.left + zoneRect.width / 2 - subject.clientWidth / 2 + "px",
              top: zoneRect.top + zoneRect.height / 2 - subject.clientHeight / 2 + "px",
              duration: 0.5,
              ease: "back.out(1.7)"
            });
          } else {
            zone.classList.remove("correct");
            zone.classList.add("incorrect");
            gsap.fromTo(
              zone,
              { x: -10 },
              {
                x: 10,
                duration: 0.1,
                yoyo: true,
                repeat: 3,
                onComplete: () => {
                  zone.classList.remove("incorrect");
                }
              }
            );
          }
        }
      });
    }

    // Animaciones de entrada con GSAP
    gsap.from("#header-overlay", { opacity: 0, y: -50, duration: 1, ease: "power2.out" });
    gsap.from("#dropzones-container", { opacity: 0, x: -100, duration: 1, delay: 0.5, ease: "power2.out" });
    gsap.from("#subjects-container .draggable", { opacity: 0, scale: 0.5, duration: 1, stagger: 0.2, ease: "back.out(1.7)" });
    gsap.from("#monster-animation", { scale: 0, duration: 1, delay: 1, ease: "bounce.out" });
    gsap.from("#glitch-animation", { rotation: -360, duration: 1.5, delay: 1.5, ease: "elastic.out(1, 0.3)" });
    gsap.from("#course-info", { opacity: 0, y: 50, duration: 1, delay: 2, ease: "power2.out" });
  } catch (error) {
    console.error("Error en creditos.js:", error);
  }
});