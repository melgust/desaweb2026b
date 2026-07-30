document.addEventListener('DOMContentLoaded', () => {
    // 1. Mostrar fecha y hora en tiempo real
    const datetimeDiv = document.getElementById('datetime');
    if (datetimeDiv) {
        function actualizarFechaHora() {
            const ahora = new Date();
            datetimeDiv.textContent = ahora.toLocaleString('es-ES', {
                dateStyle: 'full',
                timeStyle: 'medium'
            });
        }
        actualizarFechaHora();
        setInterval(actualizarFechaHora, 1000);
    }

    // 2. Contador de visitas usando localStorage
    const countSpan = document.getElementById('count');
    if (countSpan) {
        let visitas = localStorage.getItem('contadorVisitas') || 0;
        visitas++;
        localStorage.setItem('contadorVisitas', visitas);
        countSpan.textContent = visitas;
    }

    // 3. Botón para alternar tema claro / oscuro básico
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                document.body.style.backgroundColor = '#121212';
                document.body.style.color = '#e0e0e0';
            } else {
                document.body.style.backgroundColor = '#f4f6f9';
                document.body.style.color = '#333';
            }
        });
    }

    // 4. Botones "Ver más" en los proyectos para desplegar detalles
    const detallesBotones = document.querySelectorAll('.btn-details');
    detallesBotones.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            const detailsDiv = card.querySelector('.project-details');
            
            if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
                detailsDiv.style.display = 'block';
                boton.textContent = 'Ver menos';
            } else {
                detailsDiv.style.display = 'none';
                boton.textContent = 'Ver más';
            }
        });
    });

    // 5. Validación básica del formulario de contacto
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            const errorDiv = document.getElementById('form-error');

            if (!name || !email || !message) {
                errorDiv.textContent = 'Por favor, completa todos los campos del formulario.';
            } else {
                errorDiv.textContent = '';
                alert('¡Mensaje enviado con éxito! Gracias por ponerte en contacto.');
                contactForm.reset();
            }
        });
    }
});