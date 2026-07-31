export function determinarTipoArchivo(type) {
    
    let extension = ".txt";
    let compresion = true;
    let ok = true;

    switch(type){
        case "application/msword":
            extension = ".doc";
            break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            extension = ".docx";
            break;
        case "image/gif":
            extension = ".gif";
            compresion = false;
            break;
        case "text/html":
            extension = ".html";
            break;
        case "application/java-archive":
            extension = ".jar"
            compresion = false;
            break;
        case "image/jpeg":
            extension = ".jpeg"
            compresion = false;
            break;
        case "application/json":
            extension = ".json"
            break;
        case "text/markdown":
            extension = ".md";
            break;
        case "application/vnd.oasis.opendocument.presentation":
            extension = ".odp";
            break;
        case "application/vnd.oasis.opendocument.spreadsheet":
            extension = ".ods";
            break;
        case "application/vnd.oasis.opendocument.text":
            extension = ".odt";
            break;
        case "image/png":
            extension = ".png";
            compresion = false;
            break;
        case "application/pdf":
            extension = ".pdf";
            compresion = false;
            break;
        case "application/vnd.ms-powerpoint":
            extension = ".ppt";
            break;
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            extension = ".pptx";
            break;
        case "application/vnd.rar":
            extension = ".rar";
            compresion = false;
            break;
        case "application/rtf":
            extension = ".rtf";
            break;
        case "application/x-sh":
            extension = ".sh";
            break;
        case "text/plain":
            extension = ".txt";
            break;
        case "audio/wav":
            extension = ".wav";
            compresion = false;
            break;
        case "audio/webm":
            extension = ".weba";
            compresion = false;
            break;
        case "video/webm":
            extension = ".webm";
            compresion = false;
            break;
        case "application/vnd.ms-excel":
            extension = ".xls";
            break;
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            extension = ".xlsx";
            break;
        case "application/zip":
        case "application/x-zip-compressed":
            extension = ".zip";
            compresion = false;
            break;
        case "application/x-7z-compressed":
            extension = ".7z";
            compresion = false;
            break;
        default:
            ok: false;   
            
    }

    return {ext: extension, compresion: compresion, ok: ok};
}

export function limpiarNombre(nombre) {
    if (!nombre){
        return "_" + obtenerFechaFormateadaManual();
    }

    return nombre
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\r\n\t]+/g, "_")
    .replace(/[\s\u00A0]+/g, "_")
    .replace(/_+/g, "_");
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

export function determinarDuplicados(listaDeArchivos) {
    const conteo = new Map();

    listaDeArchivos.forEach( (elem) => {
        elem[0] = limpiarNombre(elem[0]);
        elem[1] = limpiarNombre(elem[1]);
        let nombreArchivo = elem[0] + '/' + elem[1]

        if(conteo.has(nombreArchivo)) {
            let indicador = conteo.get(nombreArchivo);
            elem[1] = elem[1] + "_(" + indicador + ")";
            conteo.set(nombreArchivo,indicador + 1)
        } else {
            conteo.set(nombreArchivo,1);
        }
        //console.log("detDup: ",elem);
    }
    )

    return listaDeArchivos;
    
}