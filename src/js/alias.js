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

  // Crear línea de tiempo para la animación de introducción
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
  tl.to(mainEl, { opacity: 1, duration: 1 })
    .to(mainEl, { scale: 1.2, duration: 1, delay: 0.5 })
    .to(footerEl, { opacity: 1, duration: 1 }, "-=0.5")
    .to(animationContainer, { opacity: 0, duration: 0.5, delay: 1, onComplete: () => {
      // Ocultar animación y mostrar el registro
      animationContainer.style.display = "none";
      aliasContainer.classList.remove("hidden");
      gsap.to(aliasContainer, { opacity: 1, y: 0, duration: 1 });
    }});

  // Actualizar la visualización del alias
  function updateDisplay() {
    aliasDisplay.textContent = aliasStr;
  }

  // Validar alias: solo letras, dígitos y _; longitud 4-8
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
        // Procesar el registro utilizando dos claves:
        // "selectedPlayer" para el jugador actual
        // "records" para el historial global de registros
        const now = new Date().toLocaleDateString();
        // Obtener o crear el arreglo de registros
        let records = localStorage.getItem("records");
        records = records ? JSON.parse(records) : [];
        // Buscar si ya existe un registro para el alias
        let playerRecord = records.find(record => record.alias === aliasStr);
        if (!playerRecord) {
          // Si no existe, crearlo
          playerRecord = { alias: aliasStr, score: 0, date: now };
          records.push(playerRecord);
          localStorage.setItem("records", JSON.stringify(records));
        }
        // Establecer el jugador actual en "selectedPlayer"
        localStorage.setItem("selectedPlayer", JSON.stringify(playerRecord));
        Swal.fire({
          icon: 'success',
          title: 'Alias Registrado',
          text: `¡Bienvenido, ${aliasStr}!`,
          confirmButtonColor: '#ff6700'
        }).then(() => {
          // Redirigir a la pantalla de selección de personaje
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
