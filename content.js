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
    manejarDescarga(modulo);
  });

  // 3. Inyectar el botón dentro del div .desplegarModulo
  modulo.appendChild(boton);
}

// Lógica principal de descarga
function manejarDescarga(modulo) {
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

}

// Helper: Descargar un archivo desde una URL
function descargarArchivoDirecto(url, nombreArchivo) {
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Helper: Crear y descargar un blob de texto si no hay un enlace directo
function descargarTextoComoArchivo(texto, nombreArchivo) {
  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  descargarArchivoDirecto(url, nombreArchivo);
  URL.revokeObjectURL(url);
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