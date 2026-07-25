// Función para crear e inyectar el botón en un módulo específico
function agregarBotonDescargar(modulo) {
  // Evitamos insertar duplicados si el script corre varias veces
  if (modulo.querySelector('.btn-descargar-extension')) {
    return;
  }

  // 1. Crear el botón
  const boton = document.createElement('button');
  boton.textContent = 'Descargar';
  boton.className = 'btn-descargar-extension'; // Para darle estilo en styles.css

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

  // EJEMPLO: Extraer información del módulo para descargar
  // Modifica esto según la estructura interna de tu HTML:
  const enlaceDescarga = modulo.querySelector('a')?.href;
  const tituloModulo = modulo.querySelector('h2, h3, .titulo')?.innerText.trim() || 'modulo';

  if (enlaceDescarga) {
    // Si hay una URL de archivo directa
    descargarArchivoDirecto(enlaceDescarga, `${tituloModulo}.pdf`);
  } else {
    // Si necesitas procesar texto o datos internos del div
    const contenido = modulo.innerText;
    descargarTextoComoArchivo(contenido, `${tituloModulo}.txt`);
  }
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