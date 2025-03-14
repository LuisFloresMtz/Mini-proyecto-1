document.addEventListener("DOMContentLoaded", () => {
    const dropzone = document.getElementById("dropzone");
    const dropzoneText = document.getElementById("dropzone-text");
    const characters = document.querySelectorAll(".draggable");
    const startBtn = document.getElementById("start-btn");
    let selectedCharacter = null;
    
    // Asegurarse de que el navegador no active el drag nativo
    characters.forEach(char => {
      char.setAttribute("draggable", "false");
      char.origPos = {
        x: char.offsetLeft,
        y: char.offsetTop
      };
      char.addEventListener("pointerdown", onPointerDown);
    });
    
    function onPointerDown(e) {
        const char = e.currentTarget;
        // Si ya se seleccionó un personaje y este no es el seleccionado, no permite el arrastre.
        if (selectedCharacter !== null && char.dataset.character !== selectedCharacter) {
          return;
        }
        
        e.preventDefault();
        char.setPointerCapture(e.pointerId);
        char.dragging = true;
        char.startX = e.clientX;
        char.startY = e.clientY;
        char.origX = char.offsetLeft;
        char.origY = char.offsetTop;
        char.style.position = "absolute";
        
        char.addEventListener("pointermove", onPointerMove);
        char.addEventListener("pointerup", onPointerUp);
        char.addEventListener("pointercancel", onPointerUp);
      }
    
    function onPointerMove(e) {
      const char = e.currentTarget;
      if (!char.dragging) return;
      const dx = e.clientX - char.startX;
      const dy = e.clientY - char.startY;
      char.style.left = char.origX + dx + "px";
      char.style.top = char.origY + dy + "px";
    }
    
    function onPointerUp(e) {
      const char = e.currentTarget;
      char.dragging = false;
      char.releasePointerCapture(e.pointerId);
      char.removeEventListener("pointermove", onPointerMove);
      char.removeEventListener("pointerup", onPointerUp);
      char.removeEventListener("pointercancel", onPointerUp);
      
      // Comprobar si el centro del personaje está dentro del dropzone
      const charRect = char.getBoundingClientRect();
      const dropzoneRect = dropzone.getBoundingClientRect();
      
      if (
        charRect.left + charRect.width / 2 > dropzoneRect.left &&
        charRect.left + charRect.width / 2 < dropzoneRect.right &&
        charRect.top + charRect.height / 2 > dropzoneRect.top &&
        charRect.top + charRect.height / 2 < dropzoneRect.bottom
      ) {
        selectedCharacter = char.dataset.character;
        gsap.to(char, {
          left: dropzoneRect.left + dropzoneRect.width / 2 - char.clientWidth / 2 + "px",
          top: dropzoneRect.top + dropzoneRect.height / 2 - char.clientHeight / 2 + "px",
          duration: 0.5,
          ease: "back.out(1.7)"
        });
        dropzoneText.textContent = "";
      } else {
        gsap.to(char, {
          left: char.origX + "px",
          top: char.origY + "px",
          duration: 0.5,
          ease: "power2.out"
        });
      }
    }
    
    startBtn.addEventListener("click", () => {
      if (!selectedCharacter) {
        Swal.fire({
          icon: 'warning',
          title: 'Selecciona un personaje',
          text: 'Arrastra y suelta uno de los personajes en el recuadro de selección.',
          confirmButtonColor: '#ff6700'
        });
      } else {
        localStorage.setItem("selectedCharacter", selectedCharacter);
        Swal.fire({
          icon: 'success',
          title: '¡Personaje seleccionado!',
          text: `Has elegido a ${selectedCharacter.toUpperCase()}. ¡A jugar!`,
          confirmButtonColor: '#ff6700'
        }).then(() => {
          // Redirigir o iniciar el juego
          window.location.href = "juego.html";
        });
      }
    });
  });