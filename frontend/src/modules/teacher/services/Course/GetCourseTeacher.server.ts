/* Serivicio que se encarga de obtener los cursos del estudiante */

import axios from '../../../../api/axiosInstance';
import type { TCourseTeacherResponse } from '../../types/Teacher';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;

// Tipo para la respuesta esperada según el estándar
type GetCoursesAPIResponse = {
  status: number;
  message: string;
  course: TCourseTeacherResponse;
};
export default async function GetCourseTeacherAPI(
  idCourse: TCourseTeacherResponse['id']
): Promise<TCourseTeacherResponse> {
  try {
    const response = await axios.get(`${VITE_TEACHER_ENDPOINT}/courses/${idCourse}`);
            // console.log('response', response)


    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
    }

    const responseData = response.data as GetCoursesAPIResponse;


    if (!responseData.course || typeof responseData.course !== 'object') {
      throw new Error('Respuesta del servidor inválida: no se encontró el curso');
    }


    return responseData.course;
  } catch (error) {
    console.error('Error en GetCourse:', error);
    throw error;
  }
}
