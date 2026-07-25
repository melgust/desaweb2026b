document.addEventListener("DOMContentLoaded", () => {



/* =====================================
   PROYECTOS MODAL
===================================== */


const proyectos = {


dashboard: {

titulo:"Dashboard de Datos",

descripcion:
"Desarrollo de dashboards interactivos para visualizar información y apoyar la toma de decisiones mediante análisis de datos."

},



web: {

titulo:"Sistema Web",

descripcion:
"Aplicación web para administrar información mediante tecnologías modernas, mejorando procesos y gestión de datos."

},



ia: {

titulo:"Modelo de Inteligencia Artificial",

descripcion:
"Solución basada en inteligencia artificial para análisis de datos y generación de predicciones."

}


};





window.mostrarProyecto = function(nombre){


const proyecto = proyectos[nombre];


if(!proyecto) return;



document.getElementById("tituloProyecto").textContent =
proyecto.titulo;



document.getElementById("descripcionProyecto").textContent =
proyecto.descripcion;



const modal =
new bootstrap.Modal(
document.getElementById("modalProyecto")
);


modal.show();


};







/* =====================================
   CAMBIO DE TEMA
===================================== */


const btnTema =
document.getElementById("btnTema");



btnTema.addEventListener("click",()=>{


document.body.classList.toggle("dark-mode");



if(document.body.classList.contains("dark-mode")){


btnTema.textContent="☀️ Modo claro";


localStorage.setItem(
"tema",
"oscuro"
);



}else{


btnTema.textContent="🌙 Modo oscuro";


localStorage.setItem(
"tema",
"claro"
);


}


});





// Mantener tema después de recargar

if(localStorage.getItem("tema")==="oscuro"){


document.body.classList.add("dark-mode");


btnTema.textContent="☀️ Modo claro";


}







/* =====================================
   CONTADOR DE VISITAS
===================================== */


let visitas =
localStorage.getItem("visitas");



if(!visitas){

visitas=0;

}



visitas++;



localStorage.setItem(
"visitas",
visitas
);



document.getElementById(
"contadorVisitas"
).textContent=visitas;







/* =====================================
   FECHA Y HORA
===================================== */


function actualizarFecha(){


const ahora =
new Date();



const formato =
ahora.toLocaleString(
"es-GT",
{

dateStyle:"full",

timeStyle:"medium"

}

);



document.getElementById(
"fechaHora"
).textContent=formato;


}



actualizarFecha();



setInterval(
actualizarFecha,
1000
);







/* =====================================
   VALIDACIÓN FORMULARIO
===================================== */


const formulario =
document.getElementById(
"formContacto"
);



formulario.addEventListener(
"submit",
(e)=>{


e.preventDefault();



const nombre =
document.getElementById("nombre").value.trim();



const correo =
document.getElementById("correo").value.trim();



const mensaje =
document.getElementById("mensaje").value.trim();



const respuesta =
document.getElementById(
"mensajeFormulario"
);





if(
nombre==="" ||
correo==="" ||
mensaje===""
){


respuesta.textContent =
"⚠️ Todos los campos son obligatorios.";


respuesta.style.color="red";


return;


}





const correoValido =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;



if(!correoValido.test(correo)){


respuesta.textContent =
"⚠️ Ingrese un correo electrónico válido.";


respuesta.style.color="red";


return;


}




respuesta.textContent =
"✅ Mensaje enviado correctamente.";


respuesta.style.color="green";



formulario.reset();



});



});