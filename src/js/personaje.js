document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos
    const dropzone = document.getElementById("dropzone");
    const dropzoneText = document.getElementById("dropzone-text");
    const characters = document.querySelectorAll(".draggable");
    const startBtn = document.getElementById("start-btn");
    let selectedCharacter = null;
    
    // Variables para almacenar posición original de cada personaje
    characters.forEach(char => {
      char.origPos = {
        x: char.offsetLeft,
        y: char.offsetTop
      };
      // Agregamos eventos de pointer para drag & drop
      char.addEventListener("pointerdown", onPointerDown);
    });
    
    function onPointerDown(e) {
      const char = e.currentTarget;
      char.setPointerCapture(e.pointerId);
      char.dragging = true;
      char.startX = e.clientX;
      char.startY = e.clientY;
      char.origX = char.offsetLeft;
      char.origY = char.offsetTop;
      
      char.addEventListener("pointermove", onPointerMove);
      char.addEventListener("pointerup", onPointerUp);
    }
    
    function onPointerMove(e) {
      const char = e.currentTarget;
      if (!char.dragging) return;
      const dx = e.clientX - char.startX;
      const dy = e.clientY - char.startY;
      char.style.position = "absolute";
      char.style.left = char.origX + dx + "px";
      char.style.top = char.origY + dy + "px";
    }
    
    function onPointerUp(e) {
      const char = e.currentTarget;
      char.dragging = false;
      char.removeEventListener("pointermove", onPointerMove);
      char.removeEventListener("pointerup", onPointerUp);
      
      // Comprobar si el centro del personaje cae dentro del dropzone
      const charRect = char.getBoundingClientRect();
      const dropzoneRect = dropzone.getBoundingClientRect();
      
      if (
        charRect.left + charRect.width / 2 > dropzoneRect.left &&
        charRect.left + charRect.width / 2 < dropzoneRect.right &&
        charRect.top + charRect.height / 2 > dropzoneRect.top &&
        charRect.top + charRect.height / 2 < dropzoneRect.bottom
      ) {
        // Seleccionar el personaje
        selectedCharacter = char.dataset.character;
        // Anima el encaje (snap) al centro del dropzone
        gsap.to(char, {
          left: dropzoneRect.left + dropzoneRect.width / 2 - char.clientWidth / 2 + "px",
          top: dropzoneRect.top + dropzoneRect.height / 2 - char.clientHeight / 2 + "px",
          duration: 0.5,
          ease: "back.out(1.7)"
        });
        dropzoneText.textContent = "";
      } else {
        // Si no se soltó en el dropzone, regresar a posición original con animación
        gsap.to(char, {
          left: char.origX + "px",
          top: char.origY + "px",
          duration: 0.5,
          ease: "power2.out"
        });
      }
    }
    
    // Botón para iniciar juego
    startBtn.addEventListener("click", () => {
      if (!selectedCharacter) {
        Swal.fire({
          icon: 'warning',
          title: 'Selecciona un personaje',
          text: 'Arrastra y suelta uno de los personajes en el recuadro de selección.',
          confirmButtonColor: '#ff6700'
        });
      } else {
        // Guardar selección en localStorage para mantener el progreso, por ejemplo:
        localStorage.setItem("selectedCharacter", selectedCharacter);
        Swal.fire({
          icon: 'success',
          title: '¡Personaje seleccionado!',
          text: `Has elegido a ${selectedCharacter.toUpperCase()}. ¡A jugar!`,
          confirmButtonColor: '#ff6700'
        }).then(() => {
          // Redirigir al juego o siguiente pantalla
          // location.href = "game.html";
        });
      }
    });
  });
  