eventListeners();
// lista de proyectos
var listaProyectos = document.querySelector('ul#proyectos');

function eventListeners() {

    // Document Ready
    document.addEventListener('DOMContentLoaded', function(){
        actualizarProgreso();
    });
    // boton para crear proyecto
    document.querySelector('.crear-proyecto a').addEventListener('click', nuevoProyecto);

    // Boton para una nueva tarea
    document.querySelector('.nueva-tarea').addEventListener('click', agregarTarea);

    // Botones para las acciones de las tareas
    document.querySelector('.listado-pendientes').addEventListener('click', accionesTareas);

}

function nuevoProyecto(e) {
    e.preventDefault();
    console.log('Presionaste en nuevo proyecto');

    // Crea un <input> para el nombre del nuevo proyecto
    var nuevoProyecto = document.createElement('li');
    nuevoProyecto.innerHTML = '<input type="text" id="nuevo-proyecto">';
    listaProyectos.appendChild(nuevoProyecto);

    // seleccionar el ID con el nuevoProyecto
    var inputNuevoProyecto = document.querySelector('#nuevo-proyecto');

    // al presionar enter crear el proyecto
    inputNuevoProyecto.addEventListener('keypress', function(e) {
        var tecla = e.which || e.keycode;

        if(tecla === 13) {
            guardarProyectoDB(inputNuevoProyecto.value);
            listaProyectos.removeChild(nuevoProyecto);
        }
    });
    
}

function guardarProyectoDB(nombreProyecto) {
    // Crear llamado ajax
    var xhr = new XMLHttpRequest();

    // enviar datos por formdata
    var datos = new FormData();
    datos.append('proyecto', nombreProyecto);
    datos.append('accion', 'crear');

    // Abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-proyecto.php', true);

    // En la carga
    xhr.onload = function() {
        if(this.status === 200) {
            // obtener datos de la respuesta
            var respuesta = JSON.parse(xhr.responseText);
            var proyecto = respuesta.nombre_proyecto,
                id_proyecto = respuesta.id_insertado,
                tipo = respuesta.tipo,
                resultado = respuesta.respuesta;

            // Comprobar la inserci??n
            if(resultado ==='correcto') {
                // fue exitoso
                if(tipo === 'crear') {
                    // Se creo un nuevo proyecto
                    // inyectar en el HTML
                    var nuevoProyecto = document.createElement('li');
                    nuevoProyecto.innerHTML = `
                        <a href="index.php?id_proyecto=${id_proyecto}" id="proyecto:${id_proyecto}">
                             ${proyecto}
                        </a>
                    `;
                    //agregar al html
                    listaProyectos.appendChild(nuevoProyecto);

                    // enviar alerta
                    swal({
                        title: 'Proyecto Creado',
                        text: ' El proyecto: ' + proyecto + ' se creo correctamente',
                        type: 'success'
                   })
                   .then(resultado => {
                       // redireccionar a la nueva URL
                    if(resultado.value) {
                        window.location.href = 'index.php?id_proyecto=' + id_proyecto;
                    }
                  })
                   
                   
                } else {
                    // Se actualizo o se elimino
                }
            } else {
                // hubo un error
                swal({
                    type: 'error',
                    title: 'Error!...',
                    text: 'Hubo un error!'
                  })
            }    
        }
    }

    // Enviar el Request
    xhr.send(datos);
}

// agregar una nueva tarea al proyecto actual

function agregarTarea(e) {
    e.preventDefault();
    
    var nombreTarea = document.querySelector('.nombre-tarea').value;

    // Validar que el campo tenga algo escrito

    if(nombreTarea === '') {
        swal({
            title: 'Error',
            text: 'Una tarea no puede ir vacia',
            type: 'error'
        })
    } else {
        // la tarea tiene algo, insertar en PHP

        // crear llamado a ajax
        var xhr = new XMLHttpRequest();

        // crear formdata
        var datos = new FormData();
        datos.append('tarea', nombreTarea);
        datos.append('accion', 'crear');
        datos.append('id_proyecto', document.querySelector('#id_proyecto').value );

        // Abrir la conexion
        xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

        // ejecutarlo y respuesta
        xhr.onload = function() {
            if(this.status === 200) {
                //todo correcto
                var respuesta = JSON.parse(xhr.responseText);
               // asignar valores
               var resultado = respuesta.respuesta,
                   tarea = respuesta.tarea,
                   id_insertado = respuesta.id_insertado,
                   tipo = respuesta.tipo;

                   if(respuesta.respuesta === 'correcto') {
                       // se agreg?? correcctamente
                       if(tipo === 'crear') {
                           // lanzar la alerta
                           swal({
                            type: 'success',
                            title: 'Tarea creada',
                            text: 'La tarea: ' + tarea + ' se creo correctamente'
                          });

                          // seleccionar el parrafo con la lista vacia

                          var parrafoListaVacia = document.querySelectorAll('.lista-vacia');
                          if(parrafoListaVacia.length > 0) {
                              document.querySelector('.lista-vacia').remove();
                          }

                          // construir el template
                          var nuevaTarea = document.createElement('li');

                          // agregamos el ID
                          nuevaTarea.id = 'tarea:' +id_insertado;

                          // agregar la clase tarea
                          nuevaTarea.classList.add('tarea');

                          // construir en el html
                          nuevaTarea.innerHTML = `
                               <p>${tarea}</p>
                               <div class="acciones">
                                   <i class="far fa-check-circle"></i>
                                   <i class="fas fa-trash"></i>
                                </div>   
                          `;

                          // agregarlo al HTML
                  var listado = document.querySelector('.listado-pendientes ul');
                  listado.appendChild(nuevaTarea);

                          // Limpiar el formulario
                          document.querySelector('agregar-tarea').reset();

                          // Actualizar el Progreso
                          actualizarProgreso();
               }
                   } else {
                       // hubo un error
                       swal({
                        type: 'error',
                        title: 'Error!...',
                        text: 'Hubo un error'
                      })
                   }
            }
        }

        // Enviar la consulta
        xhr.send(datos);

    }
}

// Cambia el estado de las tareas o las elimina

function accionesTareas(e) {
    e.preventDefault();

    if(e.target.classList.contains('fa-check-circle')) {
        if(e.target.classList.contains('completo')) {
            e.target.classList.remove('completo');
            cambiarEstadoTarea(e.target, 0);

        }else {
            e.target.classList.add('completo');
            cambiarEstadoTarea(e.target, 1);
        }
    }
    if(e.target.classList.contains('fa-trash')) {
        Swal.fire({
            title: 'Seguro(a)?',
            text: "Esta accion no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar!',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.value) {

                var tareaEliminar = e.target.parentElement.parentElement;
                // Borrar de la BD
                eliminarTareaBD(tareaEliminar);
                // Borrar del html
                tareaEliminar.remove();

              Swal.fire(
                'Eliminado!',
                'La tarea fue eliminada!.',
                'success'
              )
            }
          })
    }
}

// Completa o descompone una tarea
function cambiarEstadoTarea(tarea, estado) {
    var idTarea = tarea.parentElement.parentElement.id.split(':');
    
    // crear llamado ajax
    var  xhr = new XMLHttpRequest();

    // informacion
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'actualizar');
    datos.append('estado', estado);

    // abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

    // on load
    xhr.onload = function() {
        if(this.status === 200) {
          console.log(JSON.parse(xhr.responseText));
          // Actualizar el progreso;
          actualizarProgreso();
       
        }
    }
    // enviar la peticion
    xhr.send(datos);

}

// Elimina las tareas de la base de datos
function eliminarTareaBD(tarea) {
    var idTarea = tarea.id.split(':');
    
    // crear llamado ajax
    var  xhr = new XMLHttpRequest();

    // informacion
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'eliminar');


    // abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

    // on load
    xhr.onload = function() {
        if(this.status === 200) {
          console.log(JSON.parse(xhr.responseText));

          // Comprobar que haya tareas restantes
          var listaTareasRestantes = document.querySelectorAll('li.tarea');
          if(listaTareasRestantes.length === 0 ) {
              document.querySelector('.listado-pendientes ul').innerHTML = "<p class='lista-vacia'>No hay tareas en este proyecto</p>";

          }

          // Actualizar el Progreso
          actualizarProgreso();
        }
    }
    // enviar la peticion
    xhr.send(datos);
}

// Actualizar el avance del Proyecto
function actualizarProgreso() {
    // obtener todas las tareas
    const tareas = document.querySelectorAll('li.tarea');

    // obtener tareas completadas
    const tareasCompletadas = document.querySelectorAll('i.completo');

    // determinar el avance
    const avance = Math.round( (tareasCompletadas.length / tareas.length) * 100);

    // asignar el avance a la barra
    const porcentaje = document.querySelector('#porcentaje');
    porcentaje.getElementsByClassName.width = avance+'%';

    // Mostrar una alerta al completar el 100
    if(avance === 100) {
        swal({
            title: 'Proyecto Terminado',
            text: 'Ya no tienes tareas pendientes!',
            type: 'success'
        })
    }

}