document.addEventListener("DOMContentLoaded", () => {
  const returnBtn = document.getElementById("return-menu-btn");
  if (returnBtn) {
      returnBtn.addEventListener("click", () => {
          window.location.href = "menu.html";
      });
  }
});