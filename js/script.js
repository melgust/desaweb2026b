
// ===============================
// CAMBIO DE TEMA
// ===============================

const botonTema = document.getElementById("temaBtn");

botonTema.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

// ===============================
// FECHA Y HORA
// ===============================

const fechaHora = document.getElementById("fechaHora");

function actualizarFechaHora() {

    const ahora = new Date();

    fechaHora.textContent =
        "Fecha y hora: " +
        ahora.toLocaleDateString() +
        " " +
        ahora.toLocaleTimeString();

}

actualizarFechaHora();

setInterval(actualizarFechaHora, 1000);

// ===============================
// CONTADOR DE VISITAS
// ===============================

let visitas = localStorage.getItem("visitas");

if (visitas === null) {
    visitas = 1;
} else {
    visitas = Number(visitas) + 1;
}

localStorage.setItem("visitas", visitas);

document.getElementById("contadorVisitas").textContent =
    "Visitas en este navegador: " + visitas;

// ===============================
// MODAL DE PROYECTOS
// ===============================

const modal = document.getElementById("modal");
const textoModal = document.getElementById("textoModal");
const cerrarModal = document.getElementById("cerrarModal");

const botones = document.querySelectorAll(".verMas");

botones.forEach((boton) => {

    boton.addEventListener("click", () => {

        textoModal.textContent = boton.dataset.info;

        modal.style.display = "flex";

    });

});

cerrarModal.addEventListener("click", () => {

    modal.style.display = "none";

});

window.addEventListener("click", (evento) => {

    if (evento.target === modal) {

        modal.style.display = "none";

    }

});

// ===============================
// VALIDACIÓN DEL FORMULARIO
// ===============================

const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", (evento) => {

    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();

    const correo = document.getElementById("correo").value.trim();

    const mensaje = document.getElementById("mensaje").value.trim();

    const error = document.getElementById("mensajeError");

    error.style.color = "red";

    error.textContent = "";

    if (nombre === "" || correo === "" || mensaje === "") {

        error.textContent =
            "Todos los campos son obligatorios.";

        return;

    }

    const expresionCorreo =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!expresionCorreo.test(correo)) {

        error.textContent =
            "Ingrese un correo electrónico válido.";

        return;

    }

    error.style.color = "green";

    error.textContent =
        "Formulario validado correctamente.";

    formulario.reset();

});

