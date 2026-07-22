// Datos de los proyectos
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

// Elementos del DOM
const modal = document.getElementById('project-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const openButtons = document.querySelectorAll('.btn-more');
const closeElements = document.querySelectorAll('[data-close]');

// Abrir Modal
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

// Cerrar Modal
function closeModal() {
  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');
}

// Event Listeners
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