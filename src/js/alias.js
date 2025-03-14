document.addEventListener("DOMContentLoaded", () => {
    // Elementos de la animación de introducción
    const animationContainer = document.getElementById("animation-container");
    const mainEl = document.querySelector(".main");
    const footerEl = document.querySelector(".footer");
    
    // Elementos del registro de alias
    const aliasContainer = document.getElementById("alias-container");
    const aliasDisplay = document.getElementById("alias-display");
    const keys = document.querySelectorAll(".key");
    let aliasStr = "";
  
    // Crear una línea de tiempo para la animación de introducción
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(mainEl, { opacity: 1, duration: 1 })
      .to(mainEl, { scale: 1.2, duration: 1, delay: 0.5 })
      .to(footerEl, { opacity: 1, duration: 1 }, "-=0.5")
      .to(animationContainer, { opacity: 0, duration: 0.5, delay: 1, onComplete: () => {
        // Ocultar animación y mostrar el registro
        animationContainer.style.display = "none";
        aliasContainer.classList.remove("hidden");
        gsap.from(aliasContainer, { opacity: 0, y: 50, duration: 1 });
      }});
  
    // Actualizar la visualización del alias
    function updateDisplay() {
      aliasDisplay.textContent = aliasStr;
    }
  
    // Función de validación: solo letras, dígitos y _; longitud 4-8
    function validateAlias(str) {
      const regex = /^[A-Za-z0-9_]+$/;
      if (!regex.test(str)) {
        return { valid: false, message: "Solo se permiten letras, dígitos y _" };
      }
      if (str.length < 4 || str.length > 8) {
        return { valid: false, message: "El alias debe tener entre 4 y 8 caracteres." };
      }
      return { valid: true };
    }
  
    // Asignar eventos a cada tecla del teclado custom
    keys.forEach(key => {
      key.addEventListener("click", () => {
        const value = key.getAttribute("data-key");
        gsap.fromTo(key, { scale: 1.2 }, { scale: 1, duration: 0.2 });
        if (value === "BACKSPACE") {
          aliasStr = aliasStr.slice(0, -1);
        } else if (value === "ENTER") {
          const result = validateAlias(aliasStr);
          if (!result.valid) {
            Swal.fire({
              icon: 'error',
              title: 'Alias inválido',
              text: result.message,
              confirmButtonColor: '#ff6700'
            });
            return;
          }
          // Verificar en localStorage: si existe, reutilizar; si no, dar de alta con puntaje 0
          let storedScore = localStorage.getItem(aliasStr);
          if (storedScore === null) {
            localStorage.setItem(aliasStr, 0);
          }
          Swal.fire({
            icon: 'success',
            title: 'Alias Registrado',
            text: `¡Bienvenido, ${aliasStr}!`,
            confirmButtonColor: '#ff6700'
          }).then(() => {
            // Redirige a la pantalla de selección de personaje
            window.location.href = "personaje.html";
          });
        } else {
          if (aliasStr.length < 8) {
            aliasStr += value;
          }
        }
        updateDisplay();
      });
    });
  });
  