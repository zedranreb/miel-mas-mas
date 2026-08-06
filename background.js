import "./libs/zip.min.js";
import { determinarTipoArchivo, limpiarNombre, determinarDuplicados } from "./helpers.js"

zip.configure({
  useCompressionStream: true,
  useWebWorkers: false,
  transferStreams: false,
  
});

async function prepararZip(request, sender, sendResponse) {
  // Corroborar que el mensaje sea adecuado
  const mensaje = request;
  if (mensaje.tipo !== "GENERAR_ZIP") return;

  // Comenzar con la incorporacion de archivos a zip
  const lista = await determinarDuplicados(mensaje.payload);
  const zipFilename = limpiarNombre(mensaje.filename) || 'archivos.zip';

  try {
      const zipFileWriter = new zip.BlobWriter("application/zip");
      const zipFile = new zip.ZipWriter(zipFileWriter);

      const tareas = lista.map(async (elem) => {
        const carpeta = limpiarNombre(elem[0]);
        const nombre = limpiarNombre(elem[1]);
        const url = elem[2];

        const resp = await fetch(url);
        if (!resp.ok) throw new Error("HTTP " + resp.status);

        const blob = await resp.blob();
        const reader = new zip.BlobReader(blob);
        const extension = determinarTipoArchivo(blob.type);

        if(!extension.ok) {
          throw Error("Archivo con extension no soportada");
        }
        console.log(carpeta + '/' + nombre + extension.ext);

        await zipFile.add(carpeta + '/' + nombre + extension.ext, reader);
      });

      await Promise.all(tareas);

      const zipBlob = await zipFile.close();
      const respuesta = {ok: true, zip: zipBlob, filename: zipFilename};
      return respuesta;

    } catch (err) {
      console.error("Falló la carga del zip: ", err.message);
      const respuesta = {ok: false, zip: err.message, filename: null};
      return respuesta;
    }

    return true;

}

browser.runtime.onMessage.addListener(prepararZip);