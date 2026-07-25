/* =========================================================
   CAMBIO DE TEMA (CLARO / OSCURO)
   ========================================================= */
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro';
  localStorage.setItem('theme', theme);
}

// Cargar tema guardado (si existe) al iniciar la página
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(current);
});

/* =========================================================
   FECHA Y HORA ACTUAL
   ========================================================= */
function mostrarFechaHora() {
  const ahora = new Date();
  const opciones = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  document.getElementById('datetime').textContent =
    ahora.toLocaleDateString('es-GT', opciones);
}

mostrarFechaHora();
setInterval(mostrarFechaHora, 1000);

/* =========================================================
   CONTADOR DE VISITAS (persistente con localStorage)
   ========================================================= */
function actualizarContadorVisitas() {
  let visitas = parseInt(localStorage.getItem('visitas'), 10) || 0;
  visitas += 1;
  localStorage.setItem('visitas', visitas);
  document.getElementById('visit-counter').textContent =
    `Has visitado esta página ${visitas} ${visitas === 1 ? 'vez' : 'veces'}`;
}

actualizarContadorVisitas();

/* =========================================================
   BOTONES "VER MÁS" EN PROYECTOS
   ========================================================= */
document.querySelectorAll('.btn--ver-mas').forEach((boton) => {
  boton.addEventListener('click', () => {
    const detalle = document.getElementById(boton.dataset.target);
    const oculto = detalle.hasAttribute('hidden');

    if (oculto) {
      detalle.removeAttribute('hidden');
      boton.textContent = 'Ver menos';
    } else {
      detalle.setAttribute('hidden', '');
      boton.textContent = 'Ver más';
    }
  });
});

/* =========================================================
   VALIDACIÓN DEL FORMULARIO DE CONTACTO
   ========================================================= */
const form = document.getElementById('contact-form');
const nombreInput = document.getElementById('nombre');
const emailInput = document.getElementById('email');
const mensajeInput = document.getElementById('mensaje');
const successMsg = document.getElementById('form-success');

const errorNombre = document.getElementById('error-nombre');
const errorEmail = document.getElementById('error-email');
const errorMensaje = document.getElementById('error-mensaje');

function validarEmail(valor) {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(valor);
}

function limpiarErrores() {
  errorNombre.textContent = '';
  errorEmail.textContent = '';
  errorMensaje.textContent = '';
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  limpiarErrores();
  successMsg.setAttribute('hidden', '');

  let esValido = true;

  if (nombreInput.value.trim() === '') {
    errorNombre.textContent = 'El nombre no puede estar vacío.';
    esValido = false;
  }

  if (emailInput.value.trim() === '') {
    errorEmail.textContent = 'El correo electrónico no puede estar vacío.';
    esValido = false;
  } else if (!validarEmail(emailInput.value.trim())) {
    errorEmail.textContent = 'Ingresa un correo electrónico válido (ejemplo@correo.com).';
    esValido = false;
  }

  if (mensajeInput.value.trim() === '') {
    errorMensaje.textContent = 'El mensaje no puede estar vacío.';
    esValido = false;
  }

  if (esValido) {
    successMsg.removeAttribute('hidden');
    form.reset();
  }
});

/* =========================================================
   AÑO ACTUAL EN EL FOOTER
   ========================================================= */
document.getElementById('year').textContent = new Date().getFullYear();
