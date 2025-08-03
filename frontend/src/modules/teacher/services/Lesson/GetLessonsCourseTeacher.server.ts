/* Servicio encargado de crear una leccion */

/* Servicio que solicita los cursos de una categoria en especifico */
/* Serivicio que se encarga de obtener los cursos del estudiante */

import axios from '../../../../api/axiosInstance';
import type { TCourse } from '../../../courses/types/CourseStudent';
import type { TLessonsTeacherResponse } from '../../types/Teacher';
const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;
// Tipo para la respuesta esperada según el estándar
type TGetLessonTeacherAPIResponse={
    status:number
    message: string;
    lessons:TLessonsTeacherResponse;
};



export default async function GetLessonTeacherAPI(idCourse:TCourse['id']): Promise<TGetLessonTeacherAPIResponse['lessons']> {
    try {
        const id_course = idCourse
        const response = await axios.get(`${VITE_TEACHER_ENDPOINT}/courses/${id_course}/lessons`,{

        });

        // Validar status code
        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
        }

        // Validar estructura de respuesta
        const responseData = response.data as TGetLessonTeacherAPIResponse;
        if (!responseData.lessons || !Array.isArray(responseData.lessons)) {
            throw new Error('Respuesta del servidor inválida: estructura de datos incorrecta');
        }

        return responseData.lessons;

    } catch (error) {
        console.error('Error en GetCourses:', error);
        throw error;
    }
}
