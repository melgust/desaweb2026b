/* =============================================
   CONTADOR DE VISITAS
   ============================================= */
(function () {
  const key = 'profileVisits';
  const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
  localStorage.setItem(key, count);
  document.getElementById('visitCount').textContent = count;
})();

/* =============================================
   FECHA Y HORA EN TIEMPO REAL
   ============================================= */
function updateDatetime() {
  const el = document.getElementById('datetime');
  const now = new Date();
  const opts = {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  };
  el.textContent = now.toLocaleDateString('es-GT', opts);
}
updateDatetime();
setInterval(updateDatetime, 1000);

/* =============================================
   CAMBIO DE TEMA
   ============================================= */
const themeBtn   = document.getElementById('themeToggle');
const themeIcon  = themeBtn.querySelector('.theme-icon');
const savedTheme = localStorage.getItem('theme') || 'light';

document.body.classList.toggle('dark', savedTheme === 'dark');
themeIcon.textContent = savedTheme === 'dark' ? '☽' : '☀';

themeBtn.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  themeIcon.textContent = isDark ? '☽' : '☀';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

/* =============================================
   BARRAS DE PROGRESO (animadas al hacer scroll)
   ============================================= */
function animateBars() {
  document.querySelectorAll('.bar-fill').forEach(bar => {
    const rect = bar.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80 && bar.style.width === '') {
      bar.style.width = bar.dataset.width + '%';
    }
  });
}
window.addEventListener('scroll', animateBars, { passive: true });
animateBars();

/* =============================================
   DATOS DE PROYECTOS (para el modal)
   ============================================= */
const projects = [
  {
    name: 'TaskFlow',
    type: 'Web App',
    description:
      'TaskFlow es una aplicación colaborativa de gestión de proyectos inspirada en Kanban. ' +
      'Permite organizar tareas en tableros compartidos con arrastrar y soltar, asignación de responsables y etiquetas de prioridad.',
    stack: ['React', 'Node.js', 'PostgreSQL', 'Socket.io', 'Tailwind CSS'],
    highlights: [
      'Notificaciones en tiempo real con WebSockets',
      'Autenticación con JWT y roles de usuario',
      'Diseño responsivo con accesibilidad WCAG AA',
      'Historial de cambios con opción de revertir',
    ],
    link: '#',
  },
  {
    name: 'Dungeon Escape',
    type: 'Videojuego 2D',
    description:
      'Juego de aventura y puzzles desarrollado en Unity con C#. Los niveles se generan ' +
      'de forma procedural, ofreciendo una experiencia diferente en cada partida. Incluye un sistema ' +
      'de cámara dinámica con Cinemachine y controles de personaje fluidos.',
    stack: ['Unity 2022', 'C#', 'Cinemachine', 'Tilemaps', 'DOTween'],
    highlights: [
      'Generación procedural de mazmorras',
      'Sistema de cámara con confiners de mapa',
      'IA de enemigos con pathfinding A*',
      'Guardado de progreso con serialización binaria',
    ],
    link: '#',
  },
  {
    name: 'SentimentBot',
    type: 'IA / Machine Learning',
    description:
      'Modelo de clasificación de sentimientos entrenado sobre 50,000 reseñas de productos ' +
      'en español. Alcanza un 91% de precisión usando BERT fine-tuned. Expuesto como API REST ' +
      'con endpoints documentados en Swagger.',
    stack: ['Python', 'PyTorch', 'HuggingFace', 'FastAPI', 'Docker'],
    highlights: [
      '91% de precisión en conjunto de prueba',
      'Soporte multiclase: positivo, negativo, neutro',
      'API REST con autenticación por API key',
      'Contenerizado con Docker para despliegue fácil',
    ],
    link: '#',
  },
];

/* =============================================
   MODAL
   ============================================= */
const overlay = document.getElementById('modalOverlay');
const modal   = document.getElementById('modal');
const content = document.getElementById('modalContent');

function openModal(index) {
  const p = projects[index];
  const badges = p.stack.map(s => `<span class="modal-badge">${s}</span>`).join('');
  const items  = p.highlights.map(h => `<li>${h}</li>`).join('');

  content.innerHTML = `
    <p class="mono accent">${p.type}</p>
    <h3>${p.name}</h3>
    <p>${p.description}</p>
    <div style="margin:.8rem 0">${badges}</div>
    <strong style="font-size:.85rem;display:block;margin-bottom:.4rem">Características</strong>
    <ul>${items}</ul>
  `;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* =============================================
   VALIDACIÓN DE FORMULARIO
   ============================================= */
const form = document.getElementById('contactForm');

function setError(fieldId, msg) {
  const el = document.getElementById(fieldId + 'Error');
  el.textContent = msg;
  document.getElementById(fieldId).setAttribute('aria-invalid', msg ? 'true' : 'false');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  let valid     = true;

  // Reset
  ['name', 'email', 'message'].forEach(f => setError(f, ''));
  document.getElementById('formSuccess').textContent = '';

  if (!name) {
    setError('name', 'El nombre no puede estar vacío.');
    valid = false;
  }
  if (!email) {
    setError('email', 'El correo no puede estar vacío.');
    valid = false;
  } else if (!validateEmail(email)) {
    setError('email', 'Ingresa un correo electrónico válido.');
    valid = false;
  }
  if (!message) {
    setError('message', 'El mensaje no puede estar vacío.');
    valid = false;
  }

  if (valid) {
    document.getElementById('formSuccess').textContent = '¡Mensaje enviado! Te responderé pronto. 🎉';
    form.reset();
  }
});
