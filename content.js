zip.configure({
  useCompressionStream: false,
  useWebWorkers: false,
  transferStreams: false
});

function crearBoton(plantillaBoton) {
  let botonACrear         = document.createElement('button');
  botonACrear.textContent = plantillaBoton.contenido;
  botonACrear.className   = plantillaBoton.clasePrincipal + ' ' + plantillaBoton.clase;

  return botonACrear;
}

function agregarBotonUnificado(elementoHTML, parametros) {
  if (elementoHTML.querySelector('.' + parametros.boton.clasePrincipal)) {
    return;
  }

  const boton = crearBoton(parametros.boton);
  
  boton.addEventListener('click', async (evento) => {
    evento.stopPropagation();

    try {
      activarEsperaBoton(boton,'Descargando...');
      const parametrosZIP = obtenerArchivosUnificado(Object.hasOwn(parametros,"modulos") == true ? parametros.modulos : elementoHTML);
      await generarZIP(parametrosZIP.listaArchivos, parametrosZIP.nombre)

    } catch(error) {
      console.error("Error al tratar de descargar todo el contenido: ", error, error.message);
    } finally {
      desactivarEsperaBoton(boton,parametros.boton.contenido);
    }
  })

  elementoHTML.appendChild(boton);
}

function obtenerEnlaces(modulo, lista, nombreBaseCarpeta) {
  const moduloAcordeon = modulo.nextElementSibling;
    
  const tablasArchivo = moduloAcordeon.querySelectorAll('tbody');
  tablasArchivo.forEach((tabla, indiceTabla) => {
    elementoAnterior = tabla.previousElementSibling;
    
    // Si es multiple modulos tiene que contener: el "nombre del módulo" "/" "nombre tabla" 
    nombreCarpeta = nombreBaseCarpeta === 'Base' ? '' : modulo.querySelector("span").textContent.trim() + '/';
      
    if(elementoAnterior.matches('thead')) {
      nombreCarpeta += elementoAnterior.querySelector('th[colspan="2"]').textContent.trim();
    }

    tabla.querySelectorAll('tr').forEach(fila => {
        lista.push([nombreCarpeta, fila.cells[1].textContent.trim(), fila.cells[5].querySelector('a')?.href])
    })
  });
}

function obtenerArchivosUnificado(elementoHTML) {
  
  let nombreMateria         = document.querySelector("#botonDropdownCurso")?.ariaLabel;
  const elementosADescargar = []
  let nombreArchivo         = '';
  
  nombreMateria     = nombreMateria.substring(0,nombreMateria.indexOf("(")).trim();
  
  if(elementoHTML instanceof NodeList) {
    let nombreBaseCarpeta = '';
    nombreArchivo         = nombreMateria;
    elementoHTML.forEach( (modulo) => obtenerEnlaces(modulo, elementosADescargar, nombreBaseCarpeta));
  } else {
    let nombreBaseCarpeta = 'Base';
    nombreArchivo         = nombreMateria + '--' + elementoHTML.querySelector("span").textContent.trim();
    obtenerEnlaces(elementoHTML, elementosADescargar, nombreBaseCarpeta);
  }

  return {listaArchivos: elementosADescargar, nombre: nombreArchivo};
}

async function generarZIP(listaDeElementos, nombreArchivo) {
 
  await browser.runtime.sendMessage({
  tipo: "GENERAR_ZIP",
  payload: listaDeElementos,
  filename: nombreArchivo
}).then((respuesta) => {
  
  if (!respuesta || !respuesta.ok) {
    console.error("Error generando ZIP:", respuesta && respuesta.error);
    return;
  }

  const blob = respuesta.zip;
  
  if (!(blob instanceof Blob)) {
    console.error("Respuesta no contiene Blob");
    return;
  }

  descargarArchivoDirecto(blob, respuesta.filename)
  
}).catch(err => {
  console.error("sendMessage error:", err);
});

}

function activarEsperaBoton(boton, textoDeEspera) {
  boton.disabled    = true;
  boton.textContent = textoDeEspera;
}

function desactivarEsperaBoton(boton, textoDeEspera) {
 boton.disabled     = false;
 boton.textContent  = textoDeEspera; 
}

// Helper: Descargar un archivo desde una URL
function descargarArchivoDirecto(blob, nombreArchivo) {
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a");
  a.href      = url;
  a.download  = nombreArchivo || "archivos.zip";
  // Forzar click en el DOM de la página
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// --- INICIALIZACIÓN ---

function procesarModulosExistentes() {
  const modulos           = document.querySelectorAll('.desplegarModulo');
  const div               = document.querySelector('.w3-clear');
  const parametrosModulos = {boton: {contenido: "Descargar zip", clasePrincipal: 'btn-descargar-extension', clase: "w3-btn w3-orange w3-right w3-padding-small"}};
  const parametrosDiv     = {boton: {contenido: "Descargar contenido zip", clasePrincipal: 'btn-descargar-todo-extension', clase: "w3-btn w3-purple w3-right w3-padding-small"}, modulos: modulos};
  
  modulos.forEach( (mod) => agregarBotonUnificado(mod, parametrosModulos));
  agregarBotonUnificado(div,parametrosDiv);  
}

// 1. Ejecutar en los elementos ya presentes
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', procesarModulosExistentes);
} else {
  procesarModulosExistentes();
}

// 2. Observar cambios en el DOM (por si la página carga módulos dinámicamente)
const observador = new MutationObserver((mutaciones) => {
  mutaciones.forEach(() => {
    procesarModulosExistentes();
  });
});

observador.observe(document.body, {
  childList: true,
  subtree: true
});
