// =========================================================
// FECHA Y HORA EN EL ENCABEZADO
// =========================================================
function actualizarFechaHora() {
  const contenedor = document.getElementById("fecha-hora");
  const ahora = new Date();

  const opciones = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  contenedor.textContent = ahora.toLocaleString("es-GT", opciones);
}

actualizarFechaHora();
setInterval(actualizarFechaHora, 1000);

// =========================================================
// CAMBIO DE TEMA (claro / oscuro)
// =========================================================
const btnTema = document.getElementById("btn-tema");

function aplicarTemaGuardado() {
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") {
    document.body.classList.add("oscuro");
    btnTema.textContent = "☀️ Modo claro";
  }
}

btnTema.addEventListener("click", () => {
  document.body.classList.toggle("oscuro");
  const esOscuro = document.body.classList.contains("oscuro");

  btnTema.textContent = esOscuro ? "☀️ Modo claro" : "🌙 Modo oscuro";
  localStorage.setItem("tema", esOscuro ? "oscuro" : "claro");
});

aplicarTemaGuardado();

// =========================================================
// CONTADOR DE VISITAS (persistente con localStorage)
// =========================================================
function actualizarContadorVisitas() {
  const contadorSpan = document.getElementById("contador-visitas");
  let visitas = parseInt(localStorage.getItem("visitas")) || 0;
  visitas += 1;
  localStorage.setItem("visitas", visitas);
  contadorSpan.textContent = visitas;
}

actualizarContadorVisitas();

// =========================================================
// MODAL DE PROYECTOS ("Ver más")
// =========================================================
const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modal-titulo");
const modalTexto = document.getElementById("modal-texto");
const modalCerrar = document.getElementById("modal-cerrar");
const botonesVerMas = document.querySelectorAll(".btn--ver-mas");

// Información adicional de cada proyecto
const infoProyectos = {
  esperanza: {
    titulo: "La Esperanza — Sistema de Gestión Agrícola",
    texto:
      "Sistema web desarrollado con HTML, CSS, JavaScript, PHP y MySQL. Permite administrar " +
      "productores, compradores, productos, solicitudes de compra, entregas y calificaciones, " +
      "facilitando la comercialización de productos agrícolas de una comunidad.",
  },
  geoespacial: {
    titulo: "Sistema de Registro de Puntos de Interés Geoespaciales",
    texto:
      "Aplicación backend construida con Python, FastAPI, PostgreSQL y la extensión PostGIS, " +
      "desplegada mediante Docker y Nginx. Permite registrar, consultar y localizar puntos de " +
      "interés utilizando información geográfica, categorías y búsquedas por cercanía.",
  },
  "bd-empresarial": {
    titulo: "Sistema de Base de Datos Empresarial",
    texto:
      "Proyecto desarrollado en SQL Server orientado a la administración de información " +
      "empresarial. Incluye procedimientos almacenados, triggers, auditoría, transacciones, " +
      "índices, procesos ETL y un Data Warehouse para análisis de información.",
  },
};

botonesVerMas.forEach((boton) => {
  boton.addEventListener("click", () => {
    const clave = boton.dataset.proyecto;
    const proyecto = infoProyectos[clave];

    modalTitulo.textContent = proyecto.titulo;
    modalTexto.textContent = proyecto.texto;
    modal.classList.remove("oculto");
  });
});

function cerrarModal() {
  modal.classList.add("oculto");
}

modalCerrar.addEventListener("click", cerrarModal);

modal.addEventListener("click", (evento) => {
  if (evento.target === modal) {
    cerrarModal();
  }
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") {
    cerrarModal();
  }
});

// =========================================================
// VALIDACIÓN DEL FORMULARIO DE CONTACTO
// =========================================================
const formContacto = document.getElementById("form-contacto");
const campoNombre = document.getElementById("nombre");
const campoEmail = document.getElementById("email");
const campoMensaje = document.getElementById("mensaje");

const errorNombre = document.getElementById("error-nombre");
const errorEmail = document.getElementById("error-email");
const errorMensaje = document.getElementById("error-mensaje");
const formExito = document.getElementById("form-exito");

function validarEmail(valor) {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(valor);
}

function marcarError(campo, spanError, mensaje) {
  campo.classList.add("invalido");
  spanError.textContent = mensaje;
}

function limpiarError(campo, spanError) {
  campo.classList.remove("invalido");
  spanError.textContent = "";
}

formContacto.addEventListener("submit", (evento) => {
  evento.preventDefault();
  formExito.textContent = "";

  let formularioValido = true;

  // Validar nombre
  if (campoNombre.value.trim() === "") {
    marcarError(campoNombre, errorNombre, "El nombre no puede estar vacío.");
    formularioValido = false;
  } else {
    limpiarError(campoNombre, errorNombre);
  }

  // Validar correo
  if (campoEmail.value.trim() === "") {
    marcarError(campoEmail, errorEmail, "El correo no puede estar vacío.");
    formularioValido = false;
  } else if (!validarEmail(campoEmail.value.trim())) {
    marcarError(campoEmail, errorEmail, "Ingresa un correo electrónico válido.");
    formularioValido = false;
  } else {
    limpiarError(campoEmail, errorEmail);
  }

  // Validar mensaje
  if (campoMensaje.value.trim() === "") {
    marcarError(campoMensaje, errorMensaje, "El mensaje no puede estar vacío.");
    formularioValido = false;
  } else {
    limpiarError(campoMensaje, errorMensaje);
  }

  if (formularioValido) {
    formExito.textContent = "¡Mensaje enviado correctamente! Gracias por escribirme.";
    formContacto.reset();
  }
});

// Limpiar el error de un campo mientras el usuario escribe
[campoNombre, campoEmail, campoMensaje].forEach((campo) => {
  campo.addEventListener("input", () => {
    campo.classList.remove("invalido");
  });
});