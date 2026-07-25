/* =========================================================
   Perfil Profesional Interactivo — Astrid López
   JavaScript nativo (sin frameworks ni librerías)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initClock();
  initVisitCounter();
  initTypedWhoami();
  initProjectToggles();
  initContactFormValidation();
  equalizeProjectDescriptions();
  document.getElementById('year').textContent = new Date().getFullYear();
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(equalizeProjectDescriptions, 150);
});

function equalizeProjectDescriptions() {
  const descriptions = document.querySelectorAll('.project-card__desc');
  if (descriptions.length === 0) return;

  // 1. Quitar cualquier altura previa para medir el alto natural real
  descriptions.forEach(desc => { desc.style.minHeight = 'auto'; });

  // 2. Encontrar la más alta de las tres
  let maxHeight = 0;
  descriptions.forEach(desc => {
    maxHeight = Math.max(maxHeight, desc.offsetHeight);
  });

  // 3. Aplicar esa altura como mínima a todas (nunca se corta texto)
  descriptions.forEach(desc => { desc.style.minHeight = `${maxHeight}px`; });
}


/* ---------------------------------------------------------
   1. Cambio de tema (claro / oscuro)
   Se guarda la preferencia en localStorage para que se
   mantenga aunque se recargue la página.
--------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }
  updateThemeButton();

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeButton();
  });

  function updateThemeButton() {
    const isDark = document.body.classList.contains('dark');
    icon.textContent = isDark ? '☀️' : '🌙';
    label.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
  }
}


/* ---------------------------------------------------------
   2. Fecha y hora actuales en el encabezado
   Se actualiza cada segundo.
--------------------------------------------------------- */
function initClock() {
  const clockEl = document.getElementById('clock');

  function render() {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-GT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const hora = now.toLocaleTimeString('es-GT');
    clockEl.textContent = `${fecha} · ${hora}`;
  }

  render();
  setInterval(render, 1000);
}


/* ---------------------------------------------------------
   3. Contador de visitas
   Usa localStorage para que el número persista entre
   recargas de página en el mismo navegador.
--------------------------------------------------------- */
function initVisitCounter() {
  const counterEl = document.getElementById('visit-count');
  const key = 'visitCount';

  let visits = parseInt(localStorage.getItem(key), 10);
  if (isNaN(visits)) visits = 0;

  visits += 1;
  localStorage.setItem(key, visits);

  counterEl.textContent = visits;
}


/* ---------------------------------------------------------
   4. Efecto de "escritura" tipo terminal para el whoami
--------------------------------------------------------- */
function initTypedWhoami() {
  const el = document.getElementById('typed-whoami');
  const text = 'whoami';
  let i = 0;

  function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(type, 140);
    }
  }
  type();
}


/* ---------------------------------------------------------
   5. Tarjetas de proyecto: botón "Ver más" muestra/oculta
   el panel con información adicional.
--------------------------------------------------------- */
function initProjectToggles() {
  const buttons = document.querySelectorAll('.project-card__toggle');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const detail = document.getElementById(targetId);
      const isHidden = detail.hasAttribute('hidden');

      if (isHidden) {
        detail.removeAttribute('hidden');
        btn.textContent = 'Ver menos';
      } else {
        detail.setAttribute('hidden', '');
        btn.textContent = 'Ver más';
      }
    });
  });
}


/* ---------------------------------------------------------
   6. Validación del formulario de contacto
   - Ningún campo puede estar vacío.
   - El correo debe tener un formato válido.
   - No se envía a ningún servidor: solo se valida.
--------------------------------------------------------- */
function initContactFormValidation() {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');

  const errorName = document.getElementById('error-name');
  const errorEmail = document.getElementById('error-email');
  const errorMessage = document.getElementById('error-message-field');
  const successMsg = document.getElementById('form-success');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    successMsg.setAttribute('hidden', '');

    let isValid = true;

    // Validar nombre
    if (nameInput.value.trim() === '') {
      showError(nameInput, errorName, 'Por favor escribe tu nombre.');
      isValid = false;
    } else {
      clearError(nameInput, errorName);
    }

    // Validar correo
    if (emailInput.value.trim() === '') {
      showError(emailInput, errorEmail, 'Por favor escribe tu correo electrónico.');
      isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, errorEmail, 'El formato del correo no es válido. Ejemplo: nombre@dominio.com');
      isValid = false;
    } else {
      clearError(emailInput, errorEmail);
    }

    // Validar mensaje
    if (messageInput.value.trim() === '') {
      showError(messageInput, errorMessage, 'Por favor escribe un mensaje.');
      isValid = false;
    } else {
      clearError(messageInput, errorMessage);
    }

    if (isValid) {
      successMsg.removeAttribute('hidden');
      form.reset();
    }
  });

  // Limpia el error apenas la persona empieza a corregir el campo
  [nameInput, emailInput, messageInput].forEach(input => {
    input.addEventListener('input', () => {
      const errorEl = document.getElementById(
        input.id === 'message' ? 'error-message-field' : `error-${input.id}`
      );
      clearError(input, errorEl);
    });
  });

  function showError(input, errorEl, text) {
    input.classList.add('invalid');
    errorEl.textContent = text;
  }

  function clearError(input, errorEl) {
    input.classList.remove('invalid');
    errorEl.textContent = '';
  }
}