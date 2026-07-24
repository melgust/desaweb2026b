"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const CLAVE_VISITAS = "visitasPerfilSteve";
    const CLAVE_TEMA = "temaPerfilSteve";

    function obtenerPreferencia(clave) {
        try {
            return localStorage.getItem(clave);
        } catch {
            return null;
        }
    }

    function guardarPreferencia(clave, valor) {
        try {
            localStorage.setItem(clave, valor);
        } catch {
            // La página continúa funcionando si el almacenamiento no está disponible.
        }
    }

    function iniciarFechaHora() {
        const elementoFechaHora = document.getElementById("fecha-hora");

        if (!elementoFechaHora) {
            return;
        }

        const formatoFechaHora = new Intl.DateTimeFormat("es-GT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        function actualizarFechaHora() {
            elementoFechaHora.textContent = formatoFechaHora.format(new Date());
        }

        actualizarFechaHora();
        setInterval(actualizarFechaHora, 1000);
    }

    function actualizarContadorVisitas() {
        const contadorVisitas = document.getElementById("contador-visitas");

        if (!contadorVisitas) {
            return;
        }

        const valorGuardado = obtenerPreferencia(CLAVE_VISITAS);
        const visitasAnteriores = Number(valorGuardado);
        const valorValido =
            valorGuardado !== null &&
            Number.isInteger(visitasAnteriores) &&
            visitasAnteriores >= 0;
        const visitasActuales = valorValido ? visitasAnteriores + 1 : 1;

        contadorVisitas.textContent = String(visitasActuales);
        guardarPreferencia(CLAVE_VISITAS, String(visitasActuales));
    }

    function iniciarCambioTema() {
        const botonTema = document.getElementById("boton-tema");

        if (!botonTema) {
            return;
        }

        function aplicarTema(modoOscuro) {
            document.body.classList.toggle("modo-oscuro", modoOscuro);
            botonTema.textContent = modoOscuro ? "Modo claro" : "Modo oscuro";
            botonTema.setAttribute("aria-pressed", String(modoOscuro));
        }

        const temaGuardado = obtenerPreferencia(CLAVE_TEMA);
        aplicarTema(temaGuardado === "oscuro");

        botonTema.addEventListener("click", () => {
            const modoOscuro = !document.body.classList.contains("modo-oscuro");

            aplicarTema(modoOscuro);
            guardarPreferencia(CLAVE_TEMA, modoOscuro ? "oscuro" : "claro");
        });
    }

    function mostrarAnioActual() {
        const anioActual = document.getElementById("anio-actual");

        if (anioActual) {
            anioActual.textContent = String(new Date().getFullYear());
        }
    }

    function iniciarModalProyectos() {
        const botonesProyectos = document.querySelectorAll(".boton-ver-mas");
        const modal = document.getElementById("modal-proyecto");
        const contenidoModal = modal?.querySelector(".contenido-modal");
        const tituloModal = document.getElementById("modal-titulo");
        const descripcionModal = document.getElementById("modal-descripcion");
        const botonCerrar = document.getElementById("cerrar-modal");
        let botonQueAbrioModal = null;

        if (
            !modal ||
            !contenidoModal ||
            !tituloModal ||
            !descripcionModal ||
            !botonCerrar
        ) {
            return;
        }

        function abrirModal(boton) {
            tituloModal.textContent = boton.dataset.titulo || "";
            descripcionModal.textContent = boton.dataset.descripcion || "";
            botonQueAbrioModal = boton;
            modal.hidden = false;
            botonCerrar.focus();
        }

        function cerrarModal() {
            if (modal.hidden) {
                return;
            }

            modal.hidden = true;
            tituloModal.textContent = "";
            descripcionModal.textContent = "";

            if (botonQueAbrioModal) {
                botonQueAbrioModal.focus();
                botonQueAbrioModal = null;
            }
        }

        botonesProyectos.forEach((boton) => {
            boton.addEventListener("click", () => abrirModal(boton));
        });

        botonCerrar.addEventListener("click", cerrarModal);

        modal.addEventListener("click", (evento) => {
            if (evento.target === modal) {
                cerrarModal();
            }
        });

        contenidoModal.addEventListener("click", (evento) => {
            evento.stopPropagation();
        });

        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape" && !modal.hidden) {
                cerrarModal();
            }
        });
    }

    function iniciarValidacionFormulario() {
        const formulario = document.getElementById("formulario-contacto");
        const mensajeFormulario = document.getElementById("mensaje-formulario");
        const campos = {
            nombre: {
                elemento: document.getElementById("nombre"),
                error: document.getElementById("error-nombre")
            },
            correo: {
                elemento: document.getElementById("correo"),
                error: document.getElementById("error-correo")
            },
            mensaje: {
                elemento: document.getElementById("mensaje"),
                error: document.getElementById("error-mensaje")
            }
        };

        if (
            !formulario ||
            !mensajeFormulario ||
            Object.values(campos).some(({ elemento, error }) => !elemento || !error)
        ) {
            return;
        }

        function mostrarError(campo, mensaje) {
            campo.error.textContent = mensaje;
            campo.elemento.classList.add("campo-error");
            campo.elemento.setAttribute("aria-invalid", "true");
        }

        function limpiarError(campo) {
            campo.error.textContent = "";
            campo.elemento.classList.remove("campo-error");
            campo.elemento.setAttribute("aria-invalid", "false");
        }

        function limpiarMensajeFormulario() {
            mensajeFormulario.textContent = "";
            mensajeFormulario.classList.remove("mensaje-error-formulario", "mensaje-exito");
        }

        function validarNombre() {
            const nombre = campos.nombre.elemento.value.trim();

            if (!nombre) {
                mostrarError(campos.nombre, "Ingrese su nombre.");
                return false;
            }

            if (nombre.length < 2) {
                mostrarError(
                    campos.nombre,
                    "El nombre debe tener al menos 2 caracteres."
                );
                return false;
            }

            limpiarError(campos.nombre);
            return true;
        }

        function validarCorreo() {
            const correo = campos.correo.elemento.value.trim();
            const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!correo) {
                mostrarError(campos.correo, "Ingrese su correo electrónico.");
                return false;
            }

            if (!formatoCorreo.test(correo)) {
                mostrarError(campos.correo, "Ingrese un correo electrónico válido.");
                return false;
            }

            limpiarError(campos.correo);
            return true;
        }

        function validarMensaje() {
            const mensaje = campos.mensaje.elemento.value.trim();

            if (!mensaje) {
                mostrarError(campos.mensaje, "Escriba un mensaje.");
                return false;
            }

            if (mensaje.length < 10) {
                mostrarError(
                    campos.mensaje,
                    "El mensaje debe tener al menos 10 caracteres."
                );
                return false;
            }

            limpiarError(campos.mensaje);
            return true;
        }

        Object.values(campos).forEach((campo) => {
            campo.elemento.addEventListener("input", () => {
                if (campo.elemento.classList.contains("campo-error")) {
                    limpiarError(campo);
                }
            });
        });

        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();

            limpiarMensajeFormulario();
            Object.values(campos).forEach(limpiarError);

            const nombreValido = validarNombre();
            const correoValido = validarCorreo();
            const mensajeValido = validarMensaje();

            if (!nombreValido || !correoValido || !mensajeValido) {
                mensajeFormulario.textContent = "Revise los campos indicados.";
                mensajeFormulario.classList.add("mensaje-error-formulario");

                const primerCampoInvalido = formulario.querySelector(".campo-error");
                primerCampoInvalido?.focus();
                return;
            }

            formulario.reset();
            Object.values(campos).forEach(limpiarError);
            mensajeFormulario.textContent = "Formulario validado correctamente.";
            mensajeFormulario.classList.add("mensaje-exito");
        });
    }

    iniciarFechaHora();
    actualizarContadorVisitas();
    iniciarCambioTema();
    mostrarAnioActual();
    iniciarModalProyectos();
    iniciarValidacionFormulario();
});
