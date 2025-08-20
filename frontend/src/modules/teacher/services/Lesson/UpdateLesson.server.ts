/* Servicio: actualizar lección (solo image/video, sin text) */
import axios from '../../../../api/axiosInstance';
import type {
  TCourseTeacherResponse,
  TLessonTeacherResponse,
  TLessonTeacherSend
} from '../../types/Teacher';

const API = import.meta.env.VITE_TEACHER_ENDPOINT;

type TUpdateLessonAPIProps = {
  idCourse: TCourseTeacherResponse['id'];          // se mantiene aunque no se use en la ruta
  idLesson: TLessonTeacherResponse['id'];
  lessonContent: TLessonTeacherSend;               // { name?, content: { content_type, file? } }
};

// No esperamos body: resolvemos con void si el status es OK
export default async function UpdateLessonAPI(
  { idCourse, idLesson, lessonContent }: TUpdateLessonAPIProps
): Promise<void> {
  const fd = new FormData();
  const c = lessonContent.content ?? ({} as any);

  if (lessonContent.name) fd.append('name', lessonContent.name);

  // En este escenario limitas a image|video (sin text)
  if (!c?.content_type) throw new Error('content_type es requerido');
  fd.append('content_type', c.content_type as string);

/*   if (!c?.file) throw new Error('file es requerido para image|video');
  fd.append('file', c.file as File); */

  // URL: NO dupliques /teachers (ya viene en VITE_TEACHER_ENDPOINT)
  const url = `${API}/courses/lesson/${idLesson}`;

  const res = await axios.put(url, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: [(d) => d], // no serializar
    // No pongas responseType: 'json' si tu server responde vacío
  });

  // Backend “sin body”: considera 200/204 como éxito
  if (res.status !== 200 && res.status !== 204) {
    throw new Error(`HTTP ${res.status}: ${res.data?.message ?? 'Error desconocido'}`);
  }
  // No retornamos nada (void)
}
