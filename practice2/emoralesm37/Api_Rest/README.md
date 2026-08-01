// Concepto general de una API Rest
/*
Una API REST: es una forma estándar de permitir que diferentes aplicaciones se comuniquen entre sí a través de internet usando el protocolo HTTP.

Una forma sencilla de imaginarlo es esta:

Tu aplicación es un cliente que hace una petición.
La API REST recibe esa petición.
El servidor procesa la solicitud.
La API devuelve una respuesta, normalmente en formato JSON.

Características de una API REST
Usa HTTP como protocolo de comunicación.
Cada recurso tiene una URL única.
Es stateless: cada petición contiene toda la información necesaria; el servidor no depende del estado de peticiones anteriores.
Normalmente intercambia datos en JSON.
Es sencilla de consumir desde aplicaciones web, móviles o de escritorio.

En resumen: Una API REST es una interfaz que permite que aplicaciones se comuniquen mediante solicitudes HTTP (GET, POST, PUT, PATCH, DELETE) para crear, consultar, modificar o eliminar recursos, generalmente intercambiando información en formato JSON.

Conceptos Importantes

¿Qué es un Data Transfer Object (DTO)?: es un patrón de diseño cuyo único propósito es trasladar datos entre diferentes capas o partes de una aplicación de forma estructurada, tipada y segura. Un DTO no contiene lógica de negocio compleja; solo contiene atributos, su constructor, sus getters/setters y métodos para transformar o formatear la información.
 
 ¿Qué es un Controlador (Controller)?: es el "cerebro" o coordinador central de la aplicación. Su función es recibir la petición del usuario, validar las entradas, coordinar la lógica de negocio (reglas, cálculos) e invocar a otros componentes (como el DTO o el Helper) para preparar y devolver la respuesta final al cliente.

 ¿Qué es un ayudante (Helper)?: es una clase o conjunto de funciones auxiliares diseñadas para encapsular tareas repetitivas o técnicas específicas que no pertenecen directamente a la lógica de negocio central, pero que la aplicación necesita para funcionar (por ejemplo: manejar archivos, enviar correos, formatear cadenas, etc.)

Cómo estos 3 componentes se relacionan y se ejecutaron dentro del proyecto?
El DTO nos funciona para el modelado de persona, en este caso "personDTO -- Sus caracteristicas", el cual se le aplica un encapsulado dentro de la clase, el cual se transforma a Json para guardarlo y responder al cliente.
El Controller es el encargado de validar que todos los campos definidos para el modelo persona lleguen completos y valores validos.  Este tambien se encarga de procesar el CRUD de persona y tambien realiza los calculos de edad.
El Helper en este caso se encarga de interactuar con los get y puts para interactuar con los archivos; el controlador no tiene idea de cómo se guardan los datos en el disco duro; solo le pide al FileManager (el Helper) "lee" o "escribe", manteniendo un código limpio y separado por responsabilidades.
En corto:
DTO: Define la estructura de los datos.
Controller: Decide qué hacer con los datos y aplica las reglas.
Helper: Se encarga del trabajo sucio de bajo nivel (leer/escribir el archivo JSON)

INSTRUCCIONES DE USO

Primeramente debera de ubicar la ruta del proyecto para ubicar el directorio del api

C:\Users\DELL\desaweb2026b\practice2\emoralesm37\Api_Rest

Una vez ubicado en la ruta, se procede a levantar el servidor de php para que el servicio se inicie con el siguiente comando:  C:\php\php.exe -S localhost:8000 -t api   o bien    C:\php\php.exe -S localhost:8000 api/index.php

el -t y api, le permite internamente señalarle a php indicar que es un directorio y el puede ubicar donde se instalo el php y usar sus caracteristicas.
Una vez halla inicializado el servicio, podra ir a su navegado y levantar el API con la siguiente dirección: http://localhost:8000/api/persons lo cual le mostrará los diferentes IDs disponibles en el sistema.

para poder ejecutar los diferentes metodos (POST, GET, PUT, DELETE), fue necesario la instalacion de la extension Thunder Client en Visual Code Studio para simular la funcionalidad de Postman.
En dicha componente (Thunder) se puede ejecutar cualquiera de los metodos indicados, se le asigna la URL de conexion y se le da clic al botón de Send para que el sistema aplique el método solicitado.
Si se ejecuta correctamente devolverá un mensaje de 200 exitos o refuse si no logra ejecutarlo por algún inconveniente en el proceso.

Cambia el método de POST, GET, PUT, DELETE (según la elección).  
URL: http://localhost:8000/api/persons  
Ve a la pestaña Body selecciona JSON.
Pega este contenido y presiona Send

*/