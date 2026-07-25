document.addEventListener("DOMContentLoaded", () => {
    configurarTema();
    actualizarFechaHora();
    configurarContadorVisitas();
    configurarModalProyectos();
    configurarFormulario();
    mostrarAnioActual();
});

function configurarTema() {
    const botonTema = document.getElementById("botonTema");
    const iconoTema = document.getElementById("iconoTema");
    const temaGuardado = localStorage.getItem("tema");

    if (temaGuardado === "oscuro") {
        document.body.classList.add("tema-oscuro");
    }

    actualizarBotonTema(botonTema, iconoTema);

    botonTema.addEventListener("click", () => {
        document.body.classList.toggle("tema-oscuro");

        const temaActual = document.body.classList.contains("tema-oscuro") ? "oscuro" : "claro";
        localStorage.setItem("tema", temaActual);
        actualizarBotonTema(botonTema, iconoTema);
    });
}

function actualizarBotonTema(boton, icono) {
    const modoOscuro = document.body.classList.contains("tema-oscuro");

    icono.textContent = modoOscuro ? "Oscuro" : "Claro";
    boton.setAttribute(
        "aria-label",
        modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
    );
}

function actualizarFechaHora() {
    const elementoFechaHora = document.getElementById("fechaHora");

    const colocarFecha = () => {
        const ahora = new Date();

        elementoFechaHora.textContent = ahora.toLocaleString("es-GT", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    colocarFecha();
    setInterval(colocarFecha, 1000);
}

function configurarContadorVisitas() {
    const contador = document.getElementById("contadorVisitas");
    const visitasGuardadas = Number(localStorage.getItem("visitasPerfil")) || 0;
    const nuevasVisitas = visitasGuardadas + 1;

    localStorage.setItem("visitasPerfil", nuevasVisitas);
    contador.textContent = nuevasVisitas;
}

function configurarModalProyectos() {
    const proyectos = {
        audiencias: {
            titulo: "Sistema de Seguimiento de Audiencias",
            descripcion:
                "Aplicación web desarrollada para facilitar la búsqueda, consulta y organización de audiencias. La herramienta permite filtrar información y presentar resultados de una forma más rápida y comprensible.",
            tecnologias: [
                "HTML5, CSS3 y JavaScript",
                "Google Apps Script",
                "Google Sheets como repositorio de datos",
                "Filtros dinámicos y generación de consultas"
            ]
        },
        censo: {
            titulo: "Censo de NNA Institucionalizados",
            descripcion:
                "Sistema diseñado para registrar información multidisciplinaria de niños, niñas y adolescentes. Integra datos generales, área social, área psicológica, recursos familiares y seguimiento de estados.",
            tecnologias: [
                "Arquitectura modular",
                "Formularios y validaciones",
                "Control de estados por área",
                "Identificadores únicos y consolidación de datos"
            ]
        },
        portal: {
            titulo: "Portal de Consulta Estadística",
            descripcion:
                "Portal web que presenta información consolidada de denuncias, rescates, derechos vulnerados y población atendida. Su objetivo es facilitar el análisis y la elaboración de reportes.",
            tecnologias: [
                "Consultas por año y delegación",
                "Visualización de datos consolidados",
                "Diseño adaptable",
                "Exportación de resultados a PDF"
            ]
        }
    };

    const modal = document.getElementById("modalProyecto");
    const modalTitulo = document.getElementById("modalTitulo");
    const modalDescripcion = document.getElementById("modalDescripcion");
    const modalTecnologias = document.getElementById("modalTecnologias");
    const botones = document.querySelectorAll(".boton-ver-mas");
    const elementosCerrar = document.querySelectorAll("[data-cerrar-modal]");

    botones.forEach((boton) => {
        boton.addEventListener("click", () => {
            const proyectoSeleccionado = proyectos[boton.dataset.proyecto];

            modalTitulo.textContent = proyectoSeleccionado.titulo;
            modalDescripcion.textContent = proyectoSeleccionado.descripcion;
            modalTecnologias.innerHTML = "";

            proyectoSeleccionado.tecnologias.forEach((tecnologia) => {
                const elementoLista = document.createElement("li");
                elementoLista.textContent = tecnologia;
                modalTecnologias.appendChild(elementoLista);
            });

            modal.classList.add("activo");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-abierto");
            modal.querySelector(".modal-cerrar").focus();
        });
    });

    elementosCerrar.forEach((elemento) => {
        elemento.addEventListener("click", cerrarModal);
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && modal.classList.contains("activo")) {
            cerrarModal();
        }
    });

    function cerrarModal() {
        modal.classList.remove("activo");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-abierto");
    }
}

function configurarFormulario() {
    const formulario = document.getElementById("formularioContacto");
    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const mensaje = document.getElementById("mensaje");
    const mensajeExito = document.getElementById("mensajeExito");

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        limpiarErrores();
        mensajeExito.textContent = "";

        let formularioValido = true;

        if (nombre.value.trim() === "") {
            mostrarError(nombre, "errorNombre", "Por favor, escribe tu nombre.");
            formularioValido = false;
        }

        if (correo.value.trim() === "") {
            mostrarError(
                correo,
                "errorCorreo",
                "Por favor, escribe tu correo electrónico."
            );
            formularioValido = false;
        } else if (!correoValido(correo.value.trim())) {
            mostrarError(
                correo,
                "errorCorreo",
                "Ingresa un correo válido, por ejemplo: nombre@correo.com."
            );
            formularioValido = false;
        }

        if (mensaje.value.trim() === "") {
            mostrarError(
                mensaje,
                "errorMensaje",
                "Por favor, escribe un mensaje."
            );
            formularioValido = false;
        }

        if (formularioValido) {
            mensajeExito.textContent =
                "¡Formulario validado!";
            formulario.reset();
        }
    });

    [nombre, correo, mensaje].forEach((campo) => {
        campo.addEventListener("input", () => {
            campo.classList.remove("campo-invalido");

            const idError =
                campo.id === "nombre"
                    ? "errorNombre"
                    : campo.id === "correo"
                        ? "errorCorreo"
                        : "errorMensaje";

            document.getElementById(idError).textContent = "";
            mensajeExito.textContent = "";
        });
    });

    function limpiarErrores() {
        document
            .querySelectorAll(".mensaje-error")
            .forEach((elemento) => (elemento.textContent = ""));

        document
            .querySelectorAll(".campo-invalido")
            .forEach((elemento) =>
                elemento.classList.remove("campo-invalido")
            );
    }
}

function mostrarError(campo, idError, mensaje) {
    campo.classList.add("campo-invalido");
    document.getElementById(idError).textContent = mensaje;
}

function correoValido(correo) {
    const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresionCorreo.test(correo);
}

function mostrarAnioActual() {
    document.getElementById("anioActual").textContent =
        new Date().getFullYear();
}