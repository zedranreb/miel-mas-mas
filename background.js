import "./libs/zip.min.js";
console.log("Background script cargado e inicializado en Firefox. I");
/* importScripts("libs/zip.min.js"); */
zip.configure({
  useCompressionStream: true,
  useWebWorkers: false,
  transferStreams: false,
  
});
console.log("Background script cargado e inicializado en Firefox. Ib");
async function prepararZip(request, sender, sendResponse) {
  // Corroborar que el mensaje sea adecuado
  const mensaje = request;
  if (mensaje.tipo !== "GENERAR_ZIP") return;

  // Comensar con la incorporacion de archivos a zip
  const lista = mensaje.payload;
  const zipFilename = mensaje.filename || 'archivos.zip';

  try {
      const zipFileWriter = new zip.BlobWriter("application/zip");
      const zipFile = new zip.ZipWriter(zipFileWriter);

      const tareas = lista.map(async (elem) => {
        const carpeta = elem[0];
        const nombre = elem[1];
        const url = elem[2];

        const resp = await fetch(url);
        if (!resp.ok) throw new Error("HTTP " + resp.status);

        const blob = await resp.blob();
        const reader = new zip.BlobReader(blob);

        await zipFile.add('reporte.pdf', reader);
      });

      await Promise.all(tareas);

      const zipBlob = await zipFile.close();
      const respuesta = {ok: true, zip: zipBlob, filename: zipFilename};
      return respuesta;

    } catch (e) {
      const respuesta = {ok: false, zip: e.message, filename: null};
      return respuesta;
    }

    return true;

}
console.log("Background script cargado e inicializado en Firefox. II");
browser.runtime.onMessage.addListener(prepararZip);