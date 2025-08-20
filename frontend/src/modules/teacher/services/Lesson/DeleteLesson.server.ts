// Servicio que elimina una lección de un curso
import axios from '../../../../api/axiosInstance';
import type { TCourse } from '../../../courses/types/CourseStudent';
import type { TLessonTeacherResponse } from '../../types/Teacher';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;

type TDeleteLessonAPIProps = {
  idCourse: TCourse['id'];
  idLesson: TLessonTeacherResponse['id'];
};

type TDeleteLessonAPIResponse = {
  status: number;
  message: string;
};

/**
 * Elimina una lección específica de un curso.
 */
export default async function DeleteLessonAPI({
  idCourse,
  idLesson,
}: TDeleteLessonAPIProps): Promise<TDeleteLessonAPIResponse> {
  try {
    const response = await axios.delete(
       `${VITE_TEACHER_ENDPOINT}/courses/lesson/${idLesson}`
    );

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
    }

    return response.data as TDeleteLessonAPIResponse;
  } catch (error) {
    console.error('Error al eliminar la lección:', error);
    throw error;
  }
}
