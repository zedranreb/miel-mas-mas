zip.configure({
  useCompressionStream: false,
  useWebWorkers: false,
  transferStreams: false
});

// Función para crear e inyectar el botón en un módulo específico
function agregarBotonDescargar(modulo) {
  // Evitamos insertar duplicados si el script corre varias veces
  if (modulo.querySelector('.btn-descargar-extension')) {
    return;
  }

  // 1. Crear el botón
  const boton = document.createElement('button');
  const contenidoBoton = 'Descargar zip';
  boton.textContent = contenidoBoton;
  // boton.className = 'btn-descargar-extension';
  boton.className = 'btn-descargar-extension w3-btn w3-orange w3-right w3-padding-small';
  

  // 2. Manejar el evento de clic
  boton.addEventListener('click', async (evento) => {
    // Evitamos que el clic active eventos del div padre (como desplegar/cerrar el módulo)
    evento.stopPropagation();
   
    // Ejecutar lógica de descarga
    try {
      
      activarEsperaBoton(boton, "Descargando...");
      console.log("Descargando...");
      const resultado = await obtenerArchivos(modulo)
      console.log("OK: ",resultado.comment)
    
    } catch(error) {
       console.error("Error en la descarga de los archivos ", error.message);
    } finally{
      desactivarEsperaBoton(boton, contenidoBoton);
    }
      
  });

  // 3. Inyectar el botón dentro del div .desplegarModulo
  modulo.appendChild(boton);
}

// Lógica principal de descarga
function obtenerArchivos(modulo) {
  console.log('Iniciando descarga para el módulo:', modulo);
 
  const moduloAcordeon = modulo.nextElementSibling;
  const elementosADescargar = []
  
  const tablasArchivo = moduloAcordeon.querySelectorAll('tbody');
  tablasArchivo.forEach((tabla, indiceTabla) => {
    elementoAnterior = tabla.previousElementSibling;
    nombreCarpeta = "Base"
    
    if(elementoAnterior.matches('thead')) {
      nombreCarpeta = elementoAnterior.querySelector('th[colspan="2"]').textContent.trim();
    }

    tabla.querySelectorAll('tr').forEach(fila => {
        elementosADescargar.push([nombreCarpeta, fila.cells[1].textContent.trim(), fila.cells[5].querySelector('a')?.href])
    })
  });

  console.log(elementosADescargar);
  return generarZIP(elementosADescargar)
    .then(() => {return {success: true, comment: "Archivos descargados correctamente"}},
    (err) => {throw {success: false, comment: err}}) ;
}

async function generarZIP(listaDeElementos) {
 
  await browser.runtime.sendMessage({
  tipo: "GENERAR_ZIP",
  payload: listaDeElementos,
  filename: "Miel_files.zip"
}).then((respuesta) => {
  if (!respuesta || !respuesta.ok) {
    console.error("Error generando ZIP:", respuesta && respuesta.error);
    return;
  }

  // Firefox permite recibir Blob por mensaje (structured clone)
  const blob = respuesta.zip;
  if (!(blob instanceof Blob)) {
    console.error("Respuesta no contiene Blob");
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = respuesta.filename || "archivos.zip";
  // Forzar click en el DOM de la página
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}).catch(err => {
  console.error("sendMessage error:", err);
});

}

function activarEsperaBoton(boton, textoDeEspera) {
  boton.disabled = true;
  boton.textContent = textoDeEspera;
}

function desactivarEsperaBoton(boton, textoDeEspera) {
 boton.disabled = false;
 boton.textContent = textoDeEspera; 
}

// Helper: Descargar un archivo desde una URL
function descargarArchivoDirecto(url, nombreArchivo) {
  const a = document.createElement('a');
  a.href = url; 
  a.download = nombreArchivo + 'base';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// --- INICIALIZACIÓN ---

function procesarModulosExistentes() {
  const modulos = document.querySelectorAll('.desplegarModulo');
  modulos.forEach(agregarBotonDescargar);
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
