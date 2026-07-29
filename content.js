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
  boton.textContent = 'Descargar';
  boton.className = 'btn-descargar-extension';

  // 2. Manejar el evento de clic
  boton.addEventListener('click', (evento) => {
    // Evitamos que el clic active eventos del div padre (como desplegar/cerrar el módulo)
    evento.stopPropagation();
    
    // Ejecutar lógica de descarga
    obtenerArchivos(modulo);
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

  console.log(elementosADescargar)
  generarZIP(elementosADescargar)

}

async function generarZIP(listaDeElementos) {
  
  // const zip = new JSZip()
  const zipFileWriter = new zip.BlobWriter("application/zip");
  const zipFile = new zip.ZipWriter(zipFileWriter);

  const descargas = listaDeElementos.map(async (elem) => {
    console.log(elem)
    const url = elem[2];
    const carpeta = elem[0];
    const nombre = elem[1];
    const ruta =  nombre
    try {

      const respuesta = await fetch(url);
      

      if(!respuesta.ok) {
        throw new Error('Error en HTTP: ' + respuesta.status)
      }
      console.log("[INFO]: Respuesta: ", respuesta)
      repuestaBlob = await respuesta.blob();
      const blobReader = new zip.BlobReader(repuestaBlob);

      await zipFile.add("programa.pdf", blobReader);
      console.log('[INFO]: Archivo ' + ruta + ' incorporado al zip correctamente', repuestaBlob)
      
    } catch (e) {
      console.error("[ERR-Mensaje]: " + e.message )
      console.error("[ERR-Causa]: " + e.cause )

    }

  })

  await Promise.all(descargas);

  await zipFile.close();
  const zipFileBlob = await zipFileWriter.getData();
  // const contenidoZip = await zip.generateAsync({ type: "blob" });

  // descargarArchivoDirecto(blob, obtenerFechaFormateadaManual())
  // const blobZip = new Blob([contenidoZip], { type: "application/zip" })
  const enlace = document.createElement('a');
  // enlace.href = URL.createObjectURL(blobZip);
  enlace.href = URL.createObjectURL(zipFileBlob);
  enlace.download = obtenerFechaFormateadaManual() + '-base.zip';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(enlace.href);
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

function obtenerFechaFormateadaManual(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
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
