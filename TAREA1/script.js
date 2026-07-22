// ==========================================
// 1. FECHA Y HORA EN TIEMPO REAL
// ==========================================
function updateDateTime() {
  const dateElement = document.getElementById('current-date');
  const timeElement = document.getElementById('current-time');

  if (dateElement && timeElement) {
    const now = new Date();

    // Formatear fecha en formato legible en español (ej: "22 de julio de 2026")
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('es-ES', dateOptions);

    // Formatear hora con hh:mm:ss AM/PM
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const formattedTime = now.toLocaleTimeString('es-ES', timeOptions);

    dateElement.textContent = formattedDate;
    timeElement.textContent = formattedTime;
  }
}

// Ejecutar al cargar la página y actualizar cada segundo
updateDateTime();
setInterval(updateDateTime, 1000);


// ==========================================
// 2. CONTADOR DE VISITAS PERSISTENTE
// ==========================================
const visitCountElement = document.getElementById('visit-count');

if (visitCountElement) {
  // Obtener el número de visitas actual de localStorage (o 0 si es la primera vez)
  let visits = parseInt(localStorage.getItem('page_visits')) || 0;
  
  // Incrementar en 1 la visita actual
  visits += 1;
  
  // Guardar de nuevo en localStorage
  localStorage.setItem('page_visits', visits);
  
  // Reflejar en el HTML
  visitCountElement.textContent = visits;
}


// ==========================================
// 3. CAMBIO DE TEMA (MODO CLARO / OSCURO)
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Cargar preferencia guardada en localStorage o usar tema claro por defecto
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeIcon.textContent = '☀️';
} else {
  document.documentElement.setAttribute('data-theme', 'light');
  themeIcon.textContent = '🌙';
}

// Evento click para alternar modo
themeToggleBtn.addEventListener('click', () => {
  let theme = document.documentElement.getAttribute('data-theme');

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    themeIcon.textContent = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    themeIcon.textContent = '☀️';
  }
});


// ==========================================
// 4. DATOS DE LOS PROYECTOS Y MODAL (REQUISITO 4)
// ==========================================
const projectsData = {
  "1": {
    title: "Sistema ERP de Inventarios",
    description: "Desarrollo Freelance enfocado en el diseño e implementación de un sistema de gestión empresarial (ERP) para control de inventarios, optimizando la administración de productos y stock.",
    technologies: ["PHP (CodeIgniter)", "MySQL", "JavaScript", "HTML/CSS"],
    period: "2025 - 2026",
    link: null
  },
  "2": {
    title: "Landing Page Javi y su Charanga",
    description: "Sitio web estático en producción diseñado para promocionar servicios musicales, mostrar información de presentaciones y facilitar el contacto directo con la agrupación.",
    technologies: ["HTML5", "CSS3", "JavaScript", "GitHub Pages"],
    period: "2026",
    link: "https://morx-dev.github.io/LandingPageJavi/"
  },
  "3": {
    title: "Landing Page Culture Pop",
    description: "Proyecto de maquetación web centrado en experiencia de usuario (UI/UX) y diseño responsivo, adaptado a plataformas de difusión cultural y comunidad digital. (SITIO WEB ESTATICO AUN EN PRODUCCION).",
    technologies: ["HTML5", "CSS3", "Design UI/UX", "GitHub Pages"],
    period: "2026",
    link: "https://morx-dev.github.io/LandigPageCulture/"
  }
};

// Elementos del DOM para el Modal
const modal = document.getElementById('project-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const openButtons = document.querySelectorAll('.btn-more');
const closeElements = document.querySelectorAll('[data-close]');

// Función para abrir Modal
function openModal(projectId) {
  const project = projectsData[projectId];
  if (!project) return;

  modalTitle.textContent = project.title;

  let techBadges = project.technologies
    .map(tech => `<span class="tech-badge">${tech}</span>`)
    .join('');

  let linkHtml = project.link 
    ? `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="modal-link">🔗 Ver sitio web en línea</a>`
    : `<p><em>Estado: Proyecto privado de desarrollo ERP.</em></p>`;

  modalBody.innerHTML = `
    <p><strong>Período:</strong> ${project.period}</p>
    <p>${project.description}</p>
    <div class="modal-tech-list">${techBadges}</div>
    ${linkHtml}
  `;

  modal.classList.add('is-active');
  modal.setAttribute('aria-hidden', 'false');
}

// Función para cerrar Modal
function closeModal() {
  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');
}

// Event Listeners para el Modal
openButtons.forEach(button => {
  button.addEventListener('click', () => {
    const projectId = button.getAttribute('data-project');
    openModal(projectId);
  });
});

closeElements.forEach(element => {
  element.addEventListener('click', closeModal);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('is-active')) {
    closeModal();
  }
});


// ==========================================
// 5. FORMULARIO DE CONTACTO Y VALIDACIÓN (REQUISITO 5)
// ==========================================
const contactForm = document.getElementById('contact-form');
const contactResponse = document.getElementById('contact-response');

// Expresión regular para validar el formato estándar de correo electrónico
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Previene el envío por defecto

    // Obtener los elementos de entrada y sus valores sin espacios extras
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const messageValue = messageInput.value.trim();

    // 1. VALIDACIÓN: Comprobar que ningún campo esté vacío
    if (nameValue === '' || emailValue === '' || messageValue === '') {
      showResponse('⚠️ Por favor, completa todos los campos del formulario.', 'error');
      return;
    }

    // 2. VALIDACIÓN: Formato de correo electrónico válido
    if (!emailRegex.test(emailValue)) {
      showResponse('⚠️ Por favor, ingresa un correo electrónico válido (ejemplo@dominio.com).', 'error');
      emailInput.focus();
      return;
    }

    // SI LAS VALIDACIONES PASAN CON ÉXITO:
    showResponse(`¡Gracias por tu mensaje, ${nameValue}! Tu consulta ha sido registrada correctamente.`, 'success');

    // Limpiar los campos del formulario
    contactForm.reset();
  });
}

// Función auxiliar para mostrar avisos claros al usuario
function showResponse(message, type) {
  contactResponse.textContent = message;
  contactResponse.className = `contact-response ${type}`;

  // Si es un mensaje de éxito, se oculta automáticamente después de 5 segundos
  if (type === 'success') {
    setTimeout(() => {
      contactResponse.className = 'contact-response';
      contactResponse.textContent = '';
    }, 5000);
  }
}