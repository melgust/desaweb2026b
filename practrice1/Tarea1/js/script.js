// =================================
// FECHA Y HORA ACTUAL
// =================================


function actualizarFechaHora(){


    const fechaHora = 
    document.getElementById("fechaHora");


    const ahora = new Date();


    const fecha =
    ahora.toLocaleDateString("es-GT");


    const hora =
    ahora.toLocaleTimeString("es-GT");



    fechaHora.innerHTML =

    `
    ▣ Fecha: ${fecha}
    <br>
    ◷ Hora: ${hora}
    `;


}



actualizarFechaHora();



setInterval(
actualizarFechaHora,
1000
);




// =================================
// CONTADOR DE VISITAS
// =================================



let visitas = 
localStorage.getItem("visitas");



if(visitas === null){


    visitas = 1;


}else{


    visitas++;


}



localStorage.setItem(
"visitas",
visitas
);




document.getElementById(
"contadorVisitas"
).innerHTML =

`

◉ Visitas realizadas: ${visitas}

`;






// =================================
// CAMBIO DE TEMA
// SOL / LUNA GIF
// =================================



const botonTema =

document.getElementById(
"theme-btn"
);



const iconoTema =

document.getElementById(
"theme-icon"
);





botonTema.addEventListener(
"click",
()=>{


    document.body.classList.toggle(
    "dark"
    );



    // Animación del icono

    iconoTema.style.opacity="0";



    setTimeout(()=>{


        if(
        document.body.classList.contains("dark")
        ){


            iconoTema.src =
            "img/luna.gif";


        }else{


            iconoTema.src =
            "img/sol.gif";


        }



        iconoTema.style.opacity="1";



    },300);



});







// =================================
// INFORMACIÓN DE PROYECTOS
// =================================



const proyectos = {



1:{


titulo:
"Sistema Agrícola",


descripcion:

"Aplicación web orientada a conectar productores agrícolas con compradores, permitiendo gestionar productos y comunicación entre usuarios."

},





2:{


titulo:
"Base de Datos Hospital",


descripcion:

"Proyecto realizado con SQL Server para administrar información hospitalaria mediante tablas, relaciones y consultas."

},






3:{


titulo:
"QA Testing",


descripcion:

"Proyecto enfocado en aseguramiento de calidad, creación de casos de prueba, reporte de errores y validación de software."

}


};







function mostrarProyecto(id){



const modal =

document.getElementById(
"modal"
);



const titulo =

document.getElementById(
"tituloProyecto"
);



const descripcion =

document.getElementById(
"descripcionProyecto"
);





titulo.innerHTML =

proyectos[id].titulo;




descripcion.innerHTML =

proyectos[id].descripcion;





modal.style.display="flex";



}








// Cerrar modal


document.getElementById(
"cerrar"
)
.addEventListener(
"click",
()=>{


document.getElementById(
"modal"
).style.display="none";


});






// Cerrar al hacer clic afuera


window.addEventListener(
"click",
(event)=>{


const modal =

document.getElementById(
"modal"
);



if(event.target === modal){


modal.style.display="none";


}



});








// =================================
// VALIDACIÓN DEL FORMULARIO
// =================================



const formulario =

document.getElementById(
"contactForm"
);





formulario.addEventListener(
"submit",
(event)=>{


event.preventDefault();




const nombre =

document.getElementById(
"nombre"
).value.trim();




const correo =

document.getElementById(
"correo"
).value.trim();




const mensaje =

document.getElementById(
"mensaje"
).value.trim();






if(
nombre === "" ||
correo === "" ||
mensaje === ""
){


alert(
"Todos los campos son obligatorios"
);



return;


}







const validarCorreo =

/^[^\s@]+@[^\s@]+\.[^\s@]+$/;






if(
!validarCorreo.test(correo)
){


alert(
"Debe ingresar un correo electrónico válido"
);



return;


}





alert(
"Formulario enviado correctamente"
);



formulario.reset();



});