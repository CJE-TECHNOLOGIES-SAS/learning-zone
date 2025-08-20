/* =========================================================
   Servicio: LoadEvaluationLessonAPI
   Descripción: Obtiene la evaluación de una lección específica
                desde el backend y normaliza las opciones (options)
                para que siempre lleguen como array de strings.
   ========================================================= */

import axios from "../../../../api/axiosInstance"; // Cliente Axios configurado

/**
 * Función auxiliar para convertir un valor desconocido en un array de strings.
 * - Si ya es array, se retorna tal cual.
 * - Si es string y tiene formato JSON, se parsea.
 * - Si falla el parseo o el formato es inválido, retorna array vacío.
 */
const safeParseArray = (v: unknown): string[] => {
  try {
    if (Array.isArray(v)) return v as string[]; // Caso ya es array válido
    if (typeof v === "string") {
      const p = JSON.parse(v); // Intentar parsear el string JSON
      return Array.isArray(p) ? p : []; // Retornar array o vacío
    }
    return []; // Si no es ni array ni string, devolver vacío
  } catch {
    return []; // Ante cualquier error en el parseo, devolver vacío
  }
};

/**
 * Servicio para obtener la evaluación de una lección.
 * @param idCourse - ID del curso al que pertenece la lección
 * @param idLesson - ID de la lección a consultar
 * @returns Objeto con la evaluación y opciones normalizadas
 */
export default async function LoadEvaluationLessonAPI(idCourse: number, idLesson: number) {
  // Llamada HTTP GET al endpoint de evaluación
  const { data } = await axios.get(`/api/v1/teachers/courses/${idCourse}/lessons/${idLesson}/evaluation`);

  // Retornar la data con options siempre como string[]
  return {
    ...data, // Copiamos todos los campos originales
    options: safeParseArray(data.options), // Normalizamos 'options'
  };
}
