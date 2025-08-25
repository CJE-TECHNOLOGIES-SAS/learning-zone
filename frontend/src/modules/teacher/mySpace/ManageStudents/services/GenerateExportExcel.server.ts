/* Servicio para generar archivo excel */
// src/modules/teacher/mySpace/services/students/ExportStudentsExcel.server.ts

import axios from '../../../../../api/axiosInstance';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;

export type TExportStudentsExcelResult = {
  blob: Blob;       // Archivo binario en memoria (el Excel)
  filename: string; // Nombre sugerido del archivo (viene del header o fallback)
};

// Arma la URL dependiendo de si hay courseId o no
function buildExportUrl(courseId?: number) {
  const base = `${VITE_TEACHER_ENDPOINT}/students/export`; // ruta base
  return typeof courseId === 'number' ? `${base}?course_id=${courseId}` : base; // si hay id, lo pasa como query param
}

// Intenta sacar el nombre del archivo desde Content-Disposition
function getFilenameFromDisposition(dispoHeader: string | undefined, fallback: string) {
  if (!dispoHeader) return fallback; // si no hay header, usamos el fallback
  const m = dispoHeader.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i); // regex para capturar el nombre
  return m ? decodeURIComponent(m[1]) : fallback; // decodifica si existe, sino fallback
}

// Servicio principal: pide el archivo al backend y devuelve el blob + nombre
export default async function ExportStudentsExcelAPI(courseId?: number): Promise<TExportStudentsExcelResult> {
  const url = buildExportUrl(courseId); // arma la URL con o sin id
  const fallback = typeof courseId === 'number' ? `estudiantes_curso_${courseId}.xlsx` : 'estudiantes.xlsx'; // nombre por defecto

  const res = await axios.get(url, { responseType: 'blob' }); // pedimos el archivo como blob, no como JSON

  const ct = String(res.headers['content-type'] || ''); // tipo de contenido que responde el backend
  if (ct.includes('application/json')) { // si devuelve JSON, significa error
    const text = await (res.data as Blob).text?.(); // intentamos leer el error
    throw new Error(text || 'El servidor respondió JSON en lugar de un archivo.'); // lanzamos error
  }

  const dispo = String(res.headers['content-disposition'] || ''); // header donde suele venir el nombre
  const filename = getFilenameFromDisposition(dispo, fallback); // sacamos el nombre del archivo

  return { blob: res.data as Blob, filename }; // devolvemos el archivo y el nombre
}

// Helper que descarga directamente sin que el componente tenga que manejar el blob
export async function ExportAndDownloadStudentsExcel(courseId?: number) {
  const { blob, filename } = await ExportStudentsExcelAPI(courseId); // pedimos el archivo

  const href = URL.createObjectURL(blob); // creamos URL temporal en memoria para el blob
  const a = document.createElement('a'); // creamos un <a> invisible
  a.href = href; // le asignamos la URL
  a.download = filename; // le decimos qué nombre sugerir
  document.body.appendChild(a); // lo agregamos al DOM
  a.click(); // simulamos click para disparar descarga
  a.remove(); // limpiamos el DOM
  URL.revokeObjectURL(href); // liberamos la memoria del blob
}
