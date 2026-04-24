// Smooth hover glow effect
document.addEventListener("DOMContentLoaded", function () {

  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.boxShadow = `${x/10}px ${y/10}px 25px rgba(0,234,255,0.6)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = "0 0 10px rgba(0,234,255,0.2)";
    });

  });

  // MODAL FUNCTION
  function openModal(src) {
    const modal = document.getElementById("modal");
    const img = document.getElementById("modal-img");

    if (modal && img) {
      modal.style.display = "flex";
      img.src = src;
    }
  }

  // CLOSE MODAL SAFELY
  const closeBtn = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.onclick = function () {
      document.getElementById("modal").style.display = "none";
    };
  }

  // Make function global
  window.openModal = openModal;

});