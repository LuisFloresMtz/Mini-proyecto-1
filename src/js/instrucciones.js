document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  
    // Animaciones de líneas en cada sección
    // Ejemplo: .line-1 en la sección .purple
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
  
    // Repite para las demás líneas
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
        pin: true,         // anclamos la sección
        start: "top top",
        end: "+=100%"      // se mantiene pineada 100% del alto del viewport
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
      // ScrollTrigger para detectar la sección
      let targetSection = document.querySelector(link.getAttribute("href"));
      let st = ScrollTrigger.create({
        trigger: targetSection,
        start: "top top"
      });
      // Observamos la sección para activar/desactivar link
      ScrollTrigger.create({
        trigger: targetSection,
        start: "top center",
        end: "bottom center",
        onToggle: self => self.isActive && setActive(link)
      });
      // Al hacer click en un link, scrollear suave
      link.addEventListener("click", e => {
        e.preventDefault();
        gsap.to(window, {
          duration: 1,
          scrollTo: st.start, // ir al inicio de la sección
          overwrite: "auto"
        });
      });
    });
  
    function setActive(link) {
      links.forEach(el => el.classList.remove("active"));
      link.classList.add("active");
    }
  });
  