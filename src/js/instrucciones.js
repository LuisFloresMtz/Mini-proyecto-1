document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Animaciones de líneas en cada sección
  gsap.from(".line-1", {
    scrollTrigger: {
      trigger: ".line-1",
      scrub: true,
      start: "top bottom",
      end: "top top"
    },
    scaleX: 0,
    transformOrigin: "left center",
    ease: "none"
  });

  gsap.from(".line-2", {
    scrollTrigger: {
      trigger: ".red",
      scrub: true,
      pin: false,
      start: "top bottom",
      end: "top top"
    },
    scaleX: 0,
    transformOrigin: "left center",
    ease: "none"
  });

  gsap.from(".line-3", {
    scrollTrigger: {
      trigger: ".orange",
      scrub: true,
      pin: true,
      start: "top top",
      end: "+=100%"
    },
    scaleX: 0,
    transformOrigin: "left center",
    ease: "none"
  });

  gsap.from(".line-4", {
    scrollTrigger: {
      trigger: ".green",
      scrub: true,
      pin: false,
      start: "top bottom",
      end: "top top"
    },
    scaleX: 0,
    transformOrigin: "left center",
    ease: "none"
  });

  gsap.from(".line-5", {
    scrollTrigger: {
      trigger: ".pink",
      scrub: true,
      pin: true,
      start: "top top",
      end: "+=100%"
    },
    scaleX: 0,
    transformOrigin: "left center",
    ease: "none"
  });

  gsap.from(".line-6", {
    scrollTrigger: {
      trigger: ".purple2",
      scrub: true,
      pin: true,
      start: "top top",
      end: "+=100%"
    },
    scaleX: 0,
    transformOrigin: "left center",
    ease: "none"
  });

  // Navegación interna con scroll suave
  let links = gsap.utils.toArray("nav a");
  links.forEach(link => {
    let targetSection = document.querySelector(link.getAttribute("href"));
    let st = ScrollTrigger.create({
      trigger: targetSection,
      start: "top top"
    });
    ScrollTrigger.create({
      trigger: targetSection,
      start: "top center",
      end: "bottom center",
      onToggle: self => self.isActive && setActive(link)
    });
    link.addEventListener("click", e => {
      e.preventDefault();
      gsap.to(window, {
        duration: 1,
        scrollTo: st.start,
        overwrite: "auto"
      });
    });
  });

  function setActive(link) {
    links.forEach(el => el.classList.remove("active"));
    link.classList.add("active");
  }

  // Botón para regresar al menú en la sección final
  const returnBtn = document.getElementById("return-menu-btn");
  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      window.location.href = "menu.html";
    });
  }
});
