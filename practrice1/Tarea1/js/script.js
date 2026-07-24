document.addEventListener("DOMContentLoaded", () => {
    // 1. Reloj y fecha actual en tiempo real
    const datetimeEl = document.getElementById("datetime");
    function updateDateTime() {
        const now = new Date();
        datetimeEl.textContent = now.toLocaleString();
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // 2. Contador de visitas persistente con localStorage
    const countEl = document.getElementById("count");
    let visits = localStorage.getItem("page_visits");
    if (!visits) {
        visits = 1;
    } else {
        visits = parseInt(visits) + 1;
    }
    localStorage.setItem("page_visits", visits);
    countEl.textContent = visits;

    // 3. Cambio de tema (Claro / Oscuro)
    const themeToggleBtn = document.getElementById("theme-toggle");
    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
    });

    // 4. Botones "Ver más" en Proyectos (Mostrar/Ocultar detalles)
    const detailButtons = document.querySelectorAll(".btn-details");
    detailButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const details = e.target.nextElementSibling;
            if (details.style.display === "none") {
                details.style.display = "block";
                e.target.textContent = "Ver menos";
            } else {
                details.style.display = "none";
                e.target.textContent = "Ver más";
            }
        });
    });

    // 5. Validación del formulario de contacto
    const form = document.getElementById("contact-form");
    const errorMsg = document.getElementById("form-error");

    form.addEventListener("submit", (e) => {
        e.preventDefault(); // Evita que se recargue la página por defecto

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        // Validar campos vacíos
        if (name === "" || email === "" || message === "") {
            errorMsg.textContent = "Error: Ningún campo puede estar vacío.";
            return;
        }

        // Validar formato básico de correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorMsg.textContent = "Error: Por favor, introduce un correo electrónico válido.";
            return;
        }

        errorMsg.textContent = "";
        alert("¡Formulario validado con éxito! Mensaje listo (no requiere servidor).");
        form.reset();
    });
});