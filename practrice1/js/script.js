function mostrarProyecto(proyecto){

    let titulo = "";
    let descripcion = "";


    if(proyecto === "dashboard"){

        titulo = "Dashboard de Datos";

        descripcion = 
        "Proyecto desarrollado para crear visualizaciones interactivas utilizando herramientas de análisis de datos, permitiendo interpretar información de manera rápida y eficiente.";

    }


    if(proyecto === "web"){

        titulo = "Sistema Web";

        descripcion =
        "Aplicación web enfocada en la gestión de información, utilizando HTML, CSS, JavaScript y bases de datos para mejorar procesos administrativos.";

    }


    if(proyecto === "ia"){

        titulo = "Modelo de Inteligencia Artificial";

        descripcion =
        "Proyecto orientado al uso de inteligencia artificial para analizar datos, crear predicciones y automatizar procesos.";

    }



    document.getElementById("tituloProyecto").innerHTML = titulo;

    document.getElementById("descripcionProyecto").innerHTML = descripcion;



    let modal = new bootstrap.Modal(
        document.getElementById("modalProyecto")
    );


    modal.show();

}