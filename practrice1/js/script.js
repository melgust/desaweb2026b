// =========================
// CAMBIO DE TEMA
// =========================

const themeButton = document.getElementById("themeButton");

themeButton.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        themeButton.textContent = "☀️ Modo claro";

    } else {

        themeButton.textContent = "🌙 Modo oscuro";

    }

});


// =========================
// CONTADOR DE VISITAS
// =========================

let visits = localStorage.getItem("visits");

if (visits === null) {

    visits = 1;

} else {

    visits = Number(visits) + 1;

}

localStorage.setItem("visits", visits);

document.getElementById("visitCount").textContent = visits;


// =========================
// FECHA Y HORA
// =========================

function updateDateTime() {

    const now = new Date();

    const dateTime = now.toLocaleString("es-GT", {

        dateStyle: "full",

        timeStyle: "medium"

    });

    document.getElementById("dateTime").textContent = dateTime;

}

updateDateTime();

setInterval(updateDateTime, 1000);


// =========================
// INFORMACIÓN DE PROYECTOS
// =========================

function showProjectDetails(projectNumber) {

    const projectTitle =
        document.getElementById("projectTitle");

    const projectDescription =
        document.getElementById("projectDescription");

    const projectDetails =
        document.getElementById("projectDetails");


    if (projectNumber === 1) {

        projectTitle.textContent =
            "Sistema de Gestión de Agua";

        projectDescription.textContent =
            "Este proyecto consistió en desarrollar una solución tecnológica para administrar información relacionada con la gestión del agua. Se aplicaron conceptos de programación, bases de datos y desarrollo de sistemas.";

    }


    if (projectNumber === 2) {

        projectTitle.textContent =
            "Robot Resuelve Laberintos";

        projectDescription.textContent =
            "Este proyecto utilizó componentes electrónicos y programación para crear un robot capaz de recorrer un laberinto y encontrar una salida utilizando sensores.";

    }


    if (projectNumber === 3) {

        projectTitle.textContent =
            "Sistema de Información";

        projectDescription.textContent =
            "Proyecto enfocado en el análisis de requerimientos, diseño de soluciones y desarrollo de un sistema orientado a la gestión de información.";

    }


    projectDetails.classList.remove("hidden");

    projectDetails.scrollIntoView({

        behavior: "smooth"

    });

}


// BOTÓN PARA CERRAR LOS DETALLES

document
    .getElementById("closeDetails")
    .addEventListener("click", function () {

        document
            .getElementById("projectDetails")
            .classList.add("hidden");

    });


// =========================
// VALIDACIÓN DEL FORMULARIO
// =========================

const contactForm =
    document.getElementById("contactForm");


contactForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const message =
        document.getElementById("message").value.trim();


    const nameError =
        document.getElementById("nameError");

    const emailError =
        document.getElementById("emailError");

    const messageError =
        document.getElementById("messageError");

    const successMessage =
        document.getElementById("successMessage");


    nameError.textContent = "";

    emailError.textContent = "";

    messageError.textContent = "";

    successMessage.textContent = "";


    let isValid = true;


    if (name === "") {

        nameError.textContent =
            "El nombre es obligatorio.";

        isValid = false;

    }


    if (email === "") {

        emailError.textContent =
            "El correo electrónico es obligatorio.";

        isValid = false;

    } else {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(email)) {

            emailError.textContent =
                "Ingresa un correo electrónico válido.";

            isValid = false;

        }

    }


    if (message === "") {

        messageError.textContent =
            "El mensaje es obligatorio.";

        isValid = false;

    }


    if (isValid) {

        successMessage.textContent =
            "¡Formulario validado correctamente! Gracias por tu mensaje.";

        contactForm.reset();

    }

});