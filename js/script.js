document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. Fecha y Hora en tiempo real
       ========================================== */
    function updateDateTime() {
        const datetimeElement = document.getElementById('datetime');
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
        datetimeElement.textContent = now.toLocaleDateString('es-ES', options);
    }
    
    updateDateTime();
    setInterval(updateDateTime, 1000);

    /* ==========================================
       2. Contador de Visitas (localStorage)
       ========================================== */
    const visitCounterElement = document.getElementById('visit-counter');
    let visits = localStorage.getItem('page_visits');

    if (!visits) {
        visits = 1;
    } else {
        visits = parseInt(visits) + 1;
    }

    localStorage.setItem('page_visits', visits);
    visitCounterElement.textContent = `Visitas: ${visits}`;

    /* ==========================================
       3. Cambio de Tema (Modo Claro / Oscuro)
       ========================================== */
    const themeBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeBtn.textContent = '☀️ Modo Claro';
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        themeBtn.textContent = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    /* ==========================================
       4. Modal para Proyectos ("Ver más")
       ========================================== */
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalLinkContainer = document.getElementById('modal-link-container');
    const closeModal = document.getElementById('close-modal');
    const btnMores = document.querySelectorAll('.btn-more');

    const projectData = {
        '1': {
            title: 'Sistema de Gestión Comercial',
            description: 'Este repositorio contiene el diseño lógico, físico e implementaciones programables de la base de datos centralizada para Innovación S.A. El sistema asegura la persistencia, trazabilidad e integridad transaccional (Modelo ACID) del pipeline de ventas, control de interacciones comerciales (actividades) y reportes gerenciales para la toma de decisiones.',
            link: 'https://github.com/maxair180/InnovacionSA'
        },
        '2': {
            title: 'E-commerce interactivo',
            description: 'Aplicación web interactiva que simula una tienda en línea. Incluye carrito de compras dinámico, cálculo de impuestos, almacenamiento de preferencias en LocalStorage y filtrado de productos.',
            link: null
        },
        '3': {
            title: 'Sistema La Esperanza',
            description: 'Sistema web para la gestión y comercialización agrícola de la comunidad rural La Esperanza.',
            link: 'https://github.com/GarHer1399/la-esperanza'
        }
    };

    btnMores.forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.getAttribute('data-project');
            const data = projectData[projectId];

            if (data) {
                modalTitle.textContent = data.title;
                modalDescription.textContent = data.description;
                
                if (data.link) {
                    modalLinkContainer.innerHTML = `<a href="${data.link}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color); font-weight: bold; text-decoration: underline;">Ver Repositorio en GitHub ↗</a>`;
                } else {
                    modalLinkContainer.innerHTML = '';
                }

                modal.classList.remove('hidden');
            }
        });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });

    /* ==========================================
       5. Validación de Formulario
       ========================================== */
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');
    const formSuccess = document.getElementById('form-success');

    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        nameError.textContent = '';
        emailError.textContent = '';
        messageError.textContent = '';
        formSuccess.textContent = '';

        if (nameInput.value.trim() === '') {
            nameError.textContent = 'El nombre es obligatorio.';
            isValid = false;
        }

        if (emailInput.value.trim() === '') {
            emailError.textContent = 'El correo electrónico es obligatorio.';
            isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
            emailError.textContent = 'Ingrese un correo electrónico válido.';
            isValid = false;
        }

        if (messageInput.value.trim() === '') {
            messageError.textContent = 'El mensaje no puede estar vacío.';
            isValid = false;
        }

        if (isValid) {
            formSuccess.textContent = '¡Mensaje enviado con éxito!';
            form.reset();
        }
    });
});