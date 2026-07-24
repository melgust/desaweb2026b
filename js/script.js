/* ==========================================================================
   DESARROLLO WEB UMG - PRÁCTICA 1: PERFIL PROFESIONAL INTERACTIVO
   Funcionalidades con JavaScript Nativo (Vanilla JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------------------
       1. RELOJ Y FECHA EN TIEMPO REAL
       ---------------------------------------------------------------------- */
    const datetimeElement = document.getElementById('live-datetime');

    function updateLiveDateTime() {
        const now = new Date();
        
        // Opciones de formato para fecha en español
        const dateOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const dateString = now.toLocaleDateString('es-ES', dateOptions);
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        // Capitalizar la primera letra del día de la semana
        const formattedDate = dateString.charAt(0).toUpperCase() + dateString.slice(1);
        
        if (datetimeElement) {
            datetimeElement.textContent = `${formattedDate} | ${timeString}`;
        }
    }

    // Iniciar reloj inmediatamente y actualizar cada segundo
    updateLiveDateTime();
    setInterval(updateLiveDateTime, 1000);


    /* ----------------------------------------------------------------------
       2. CONTADOR DE VISITAS CON LOCALSTORAGE
       ---------------------------------------------------------------------- */
    const visitCountElement = document.getElementById('visit-count');

    function initVisitCounter() {
        let visits = localStorage.getItem('umg_profile_visits');

        if (!visits) {
            visits = 1;
        } else {
            visits = parseInt(visits, 10) + 1;
        }

        localStorage.setItem('umg_profile_visits', visits);

        if (visitCountElement) {
            visitCountElement.textContent = visits;
        }
    }

    initVisitCounter();


    /* ----------------------------------------------------------------------
       3. CAMBIO DE TEMA (MODO CLARO / MODO OSCURO)
       ---------------------------------------------------------------------- */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    // Recuperar tema guardado en localStorage o predeterminado 'dark'
    const savedTheme = localStorage.getItem('umg_app_theme') || 'dark';
    applyTheme(savedTheme);

    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('umg_app_theme', theme);

        if (themeIcon) {
            if (theme === 'light') {
                themeIcon.className = 'fa-solid fa-moon';
                themeToggleBtn.setAttribute('title', 'Cambiar a Modo Oscuro');
            } else {
                themeIcon.className = 'fa-solid fa-sun';
                themeToggleBtn.setAttribute('title', 'Cambiar a Modo Claro');
            }
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }


    /* ----------------------------------------------------------------------
       4. MODAL DETALLE DE PROYECTOS ("Ver más")
       ---------------------------------------------------------------------- */
    const projectsData = {
        '1': {
            title: 'Dashboard Analytics Web',
            category: 'Web App & Data',
            img: 'img/project1.jpg',
            description: 'Plataforma web avanzada desarrollada para la gestión y análisis visual de grandes volúmenes de información en tiempo real. Incluye gráficos interactivos, filtros personalizados, exportación de reportes PDF/Excel y diseño totalmente adaptable.',
            technologies: ['HTML5', 'CSS3 Grid', 'JavaScript ES6', 'Chart.js', 'LocalStorage']
        },
        '2': {
            title: 'App Móvil de Gestión y Productividad',
            category: 'UI / Mobile',
            img: 'img/project2.jpg',
            description: 'Aplicación diseñada para optimizar la organización personal y el seguimiento de metas. Ofrece interfaz gestual limpia, sistema de priorización Kanban, notificaciones locales y sincronización de datos en segundo plano.',
            technologies: ['JavaScript ES6', 'CSS Animations', 'IndexedDB', 'PWA Architecture', 'Responsive UX']
        },
        '3': {
            title: 'Portal de APIs & Microservicios Cloud',
            category: 'Backend & Cloud',
            img: 'img/project3.jpg',
            description: 'Arquitectura de servicios web de alta concurrencia con documentación interactiva en vivo, autenticación mediante Tokens JWT, limitación de tasa (rate-limiting) y monitor de estado de servicios en la nube.',
            technologies: ['REST API', 'JSON Schema', 'Node.js Core', 'Git Workflow', 'OAuth2']
        }
    };

    const modal = document.getElementById('project-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalTag = document.getElementById('modal-tag');
    const modalImg = document.getElementById('modal-img');
    const modalDescription = document.getElementById('modal-description');
    const modalTechList = document.getElementById('modal-tech-list');
    const modalActionBtn = document.getElementById('modal-action-btn');

    const modalTriggers = document.querySelectorAll('.btn-modal-trigger');

    modalTriggers.forEach(button => {
        button.addEventListener('click', (e) => {
            const projectId = button.getAttribute('data-project');
            const data = projectsData[projectId];

            if (data) {
                modalTitle.textContent = data.title;
                modalTag.textContent = data.category;
                modalImg.src = data.img;
                modalImg.alt = data.title;
                modalDescription.textContent = data.description;

                // Cargar tecnologías
                modalTechList.innerHTML = '';
                data.technologies.forEach(tech => {
                    const li = document.createElement('li');
                    li.textContent = tech;
                    modalTechList.appendChild(li);
                });

                // Mostrar modal
                openModal();
            }
        });
    });

    function openModal() {
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Restaurar scroll
        }
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    // Cerrar al hacer clic fuera del contenido modal
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    if (modalActionBtn) {
        modalActionBtn.addEventListener('click', () => {
            alert('¡Demostración interactiva de proyecto simulada con éxito!');
            closeModal();
        });
    }


    /* ----------------------------------------------------------------------
       5. VALIDACIÓN DEL FORMULARIO DE CONTACTO
       ---------------------------------------------------------------------- */
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');
    const formAlert = document.getElementById('form-alert');

    // Función Expresión Regular para formato de correo
    function isValidEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase().trim());
    }

    function clearErrors() {
        [nameInput, emailInput, messageInput].forEach(input => {
            if (input) input.classList.remove('invalid');
        });

        if (nameError) nameError.textContent = '';
        if (emailError) emailError.textContent = '';
        if (messageError) messageError.textContent = '';

        if (formAlert) {
            formAlert.style.display = 'none';
            formAlert.className = 'form-alert';
            formAlert.textContent = '';
        }
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevenir el envío tradicional
            clearErrors();

            let isValid = true;

            // Validar Nombre
            if (!nameInput.value.trim()) {
                nameInput.classList.add('invalid');
                nameError.textContent = 'El nombre completo es obligatorio.';
                isValid = false;
            }

            // Validar Email
            const emailValue = emailInput.value.trim();
            if (!emailValue) {
                emailInput.classList.add('invalid');
                emailError.textContent = 'El correo electrónico es obligatorio.';
                isValid = false;
            } else if (!isValidEmail(emailValue)) {
                emailInput.classList.add('invalid');
                emailError.textContent = 'Por favor, ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).';
                isValid = false;
            }

            // Validar Mensaje
            if (!messageInput.value.trim()) {
                messageInput.classList.add('invalid');
                messageError.textContent = 'El mensaje no puede estar vacío.';
                isValid = false;
            }

            // Mostrar resultado en el banner de alerta
            if (!isValid) {
                formAlert.className = 'form-alert error';
                formAlert.textContent = '❌ Por favor, corrige los errores señalados en el formulario antes de continuar.';
                formAlert.style.display = 'block';
            } else {
                formAlert.className = 'form-alert success';
                formAlert.textContent = '✅ ¡Mensaje enviado con éxito! Gracias por ponerte en contacto.';
                formAlert.style.display = 'block';

                // Limpiar campos del formulario
                contactForm.reset();
            }
        });
    }

});
