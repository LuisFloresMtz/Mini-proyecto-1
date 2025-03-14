document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("credits-container");
  const subjects = Array.from(document.querySelectorAll(".draggable"));
  const dropZones = Array.from(document.querySelectorAll(".drop-zone"));

  // Inicializar posición, velocidad y estado para cada sujeto
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
    subject.style.left = subject.pos.x + "px";
    subject.style.top = subject.pos.y + "px";
  });

  // Animación: mover los sujetos rebotando
  function animateSubjects() {
    subjects.forEach(subject => {
      if (!subject.dragging) {
        subject.pos.x += subject.vel.x;
        subject.pos.y += subject.vel.y;
        // Rebote en los bordes
        if (subject.pos.x <= 0 || subject.pos.x + subject.clientWidth >= container.clientWidth) {
          subject.vel.x *= -1;
        }
        if (subject.pos.y <= 0 || subject.pos.y + subject.clientHeight >= container.clientHeight) {
          subject.vel.y *= -1;
        }
        subject.style.left = subject.pos.x + "px";
        subject.style.top = subject.pos.y + "px";
      }
    });
    requestAnimationFrame(animateSubjects);
  }
  animateSubjects();

  // Implementación de drag & drop con pointer events
  subjects.forEach(subject => {
    subject.addEventListener("pointerdown", onPointerDown);
  });

  function onPointerDown(e) {
    const subject = e.currentTarget;
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
    const dx = e.clientX - subject.startX;
    const dy = e.clientY - subject.startY;
    subject.pos.x = subject.initialPos.x + dx;
    subject.pos.y = subject.initialPos.y + dy;
    subject.style.left = subject.pos.x + "px";
    subject.style.top = subject.pos.y + "px";
  }

  function onPointerUp(e) {
    const subject = e.currentTarget;
    subject.dragging = false;
    subject.style.cursor = "grab";
    subject.removeEventListener("pointermove", onPointerMove);
    subject.removeEventListener("pointerup", onPointerUp);

    // Verificar si el centro del sujeto está en alguna drop zone
    const subjectRect = subject.getBoundingClientRect();
    dropZones.forEach(zone => {
      const zoneRect = zone.getBoundingClientRect();
      if (
        subjectRect.left + subjectRect.width / 2 > zoneRect.left &&
        subjectRect.left + subjectRect.width / 2 < zoneRect.right &&
        subjectRect.top + subjectRect.height / 2 > zoneRect.top &&
        subjectRect.top + subjectRect.height / 2 < zoneRect.bottom
      ) {
        if (subject.dataset.id === zone.dataset.target) {
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
          gsap.fromTo(zone, { x: -10 }, { x: 10, duration: 0.1, yoyo: true, repeat: 3, onComplete: () => {
            zone.classList.remove("incorrect");
          }});
        }
      }
    });
  }

  // Animaciones de entrada con GSAP para elementos de la pantalla
  gsap.from("#header-overlay", { opacity: 0, y: -50, duration: 1, ease: "power2.out" });
  gsap.from("#dropzones-container", { opacity: 0, x: -100, duration: 1, delay: 0.5, ease: "power2.out" });
  gsap.from("#subjects-container .draggable", { opacity: 0, scale: 0.5, duration: 1, stagger: 0.2, ease: "back.out(1.7)" });
  gsap.from("#monster-animation", { scale: 0, duration: 1, delay: 1, ease: "bounce.out" });
  gsap.from("#glitch-animation", { rotation: -360, duration: 1.5, delay: 1.5, ease: "elastic.out(1, 0.3)" });
  gsap.from("#course-info", { opacity: 0, y: 50, duration: 1, delay: 2, ease: "power2.out" });
});
