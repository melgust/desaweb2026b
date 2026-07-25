document.addEventListener("DOMContentLoaded", () => {
  
  // -------------------------------------------------------------
  // 1. CAMBIO DE TEMA (Claro / Oscuro)
  // -------------------------------------------------------------
  const themeToggleBtn = document.getElementById("theme-toggle");
  
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    
    if (document.body.classList.contains("dark-theme")) {
      themeToggleBtn.textContent = "Modo Claro";
    } else {
      themeToggleBtn.textContent = "Modo Oscuro";
    }
  });

  // -------------------------------------------------------------
  // 2. FECHA Y HORA EN TIEMPO REAL
  // -------------------------------------------------------------
  const datetimeDisplay = document.getElementById("datetime");

  function updateDateTime() {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    datetimeDisplay.textContent = now.toLocaleDateString('es-ES', options);
  }

  updateDateTime();
  setInterval(updateDateTime, 1000); // Actualiza cada segundo

  // -------------------------------------------------------------
  // 3. CONTADOR DE VISITAS (LocalStorage)
  // -------------------------------------------------------------
  const visitCounterDisplay = document.getElementById("visit-counter");
  let visits = localStorage.getItem("page_visits");

  if (!visits) {
    visits = 1;
  } else {
    visits = parseInt(visits) + 1;
  }

  localStorage.setItem("page_visits", visits);
  visitCounterDisplay.textContent = visits;

  // -------------------------------------------------------------
  // 4. MODAL "VER MÁS" EN PROYECTOS
  // -------------------------------------------------------------
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const closeBtn = document.querySelector(".close-btn");
  const moreBtns = document.querySelectorAll(".btn-more");

  moreBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".project-card");
      const title = card.querySelector("h3").textContent;
      const info = e.target.getAttribute("data-info");

      modalTitle.textContent = title;
      modalDescription.textContent = info;
      modal.style.display = "block";
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // -------------------------------------------------------------
  // 5. VALIDACIÓN DEL FORMULARIO DE CONTACTO
  // -------------------------------------------------------------
  const contactForm = document.getElementById("contact-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");

  const errorName = document.getElementById("error-name");
  const errorEmail = document.getElementById("error-email");
  const errorMessage = document.getElementById("error-message");
  const formSuccess = document.getElementById("form-success");

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Evitar recargar la página

    let isValid = true;

    // Limpiar mensajes anteriores
    errorName.textContent = "";
    errorEmail.textContent = "";
    errorMessage.textContent = "";
    formSuccess.textContent = "";

    // Validar Nombre
    if (nameInput.value.trim() === "") {
      errorName.textContent = "El campo nombre es obligatorio.";
      isValid = false;
    }

    // Validar Email
    if (emailInput.value.trim() === "") {
      errorEmail.textContent = "El correo electrónico es obligatorio.";
      isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
      errorEmail.textContent = "Ingrese un correo electrónico válido.";
      isValid = false;
    }

    // Validar Mensaje
    if (messageInput.value.trim() === "") {
      errorMessage.textContent = "El mensaje no puede estar vacío.";
      isValid = false;
    }

    // Si todo está correcto
    if (isValid) {
      formSuccess.textContent = "¡Mensaje enviado con éxito!";
      contactForm.reset();
    }
  });

});