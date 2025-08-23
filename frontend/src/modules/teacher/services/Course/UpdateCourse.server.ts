/* Servicio: actualizar curso (FormData opcional + file) */
import axios from '../../../../api/axiosInstance';
import type { TCourseTeacherResponse } from '../../types/Teacher';

const API = import.meta.env.VITE_TEACHER_ENDPOINT;

type TUpdateCourseAPIResponse = {
  status?: number;              // opcional por si no viene
  message?: string;
  id_course: TCourseTeacherResponse['id'];
};

type TCourseToSend = {
  name?: string;
  description?: string;
  image?: File | null | string; // del form puede venir string (url existente) o File
};

type TUpdateCourseAPIProps = {
  id_course: TCourseTeacherResponse['id'];
  courseToSend: TCourseToSend;
};

export default async function UpdateCourseAPI(
  { id_course, courseToSend }: TUpdateCourseAPIProps
): Promise<TCourseTeacherResponse['id']> {
  // Normaliza lo que realmente vas a enviar
  const name = typeof courseToSend.name === 'string' ? courseToSend.name.trim() : undefined;
  const description = typeof courseToSend.description === 'string' ? courseToSend.description.trim() : undefined;
  const imageFile = courseToSend.image instanceof File ? courseToSend.image : undefined;

  const hasName = !!name;
  const hasDescription = !!description;
  const hasImage = !!imageFile;

  // Si no hay cambios reales, evita pegarle al backend y confundir a la UI
  if (!hasName && !hasDescription && !hasImage) {
    throw new Error('No hay cambios para actualizar');
  }

  const fd = new FormData();
  if (hasName) fd.append('name', name!);
  if (hasDescription) fd.append('description', description!);
  if (hasImage) fd.append('image', imageFile!);

  const url = `${API}/courses/${id_course}`;

  const res = await axios.put(url, fd, {
    // No seteamos Content-Type manualmente: Axios agrega el boundary correcto
    transformRequest: [(d) => d], // evita que alguien “liste” serialice el FormData
  });

  // Éxito: 200 (tu backend devuelve body con id_course) o 204 (sin body)
  if (res.status !== 200 && res.status !== 204) {
    throw new Error(`HTTP ${res.status}: ${res.data?.message ?? 'Error desconocido'}`);
  }

  // En 200 esperamos id_course en el body; si llega 204 no hay body, pero mantenemos contrato simple
  const data = res.data as TUpdateCourseAPIResponse | undefined;

  if (res.status === 200) {
    if (!data?.id_course || typeof data.id_course !== 'number') {
      throw new Error('Respuesta inválida: no se recibió un ID de curso correcto');
    }
    return data.id_course;
  }

  // Si tu server algún día retorna 204, devolvemos el id que mandaste (fallback sensato)
  return id_course;
}
