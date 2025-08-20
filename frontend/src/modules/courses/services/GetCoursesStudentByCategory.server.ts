/* Servicio que solicita los cursos de una categoria en especifico */
/* Serivicio que se encarga de obtener los cursos del estudiante */

import axios from '../../../api/axiosInstance';
import type { TCourse, TCoursesStudents } from '../types/CourseStudent';

const VITE_GETCOURSES_ENDPOINT = import.meta.env.VITE_GETCOURSES_ENDPOINT;

// Tipo para la respuesta esperada según el estándar
type GetCoursesCategoryAPIResponse = {
  status: number;
  message: string;
  courses: TCoursesStudents;
};

export default async function GetCoursesStudentByCategoryAPI(category:TCourse['category']): Promise<TCoursesStudents> {
    try {
        /* Construir endpoint siguiendo el patrón correcto y codificando la categoría */
        // Codificar la categoría para manejar espacios y caracteres especiales
        const encodedCategory = encodeURIComponent(category);

        // Usar el patrón correcto: /courses/category/{category} en lugar de solo /{category}
        const fullUrl = `${VITE_GETCOURSES_ENDPOINT}/category/${encodedCategory}`;
        console.log('🔗 GetCoursesStudentByCategory - URL construida:', fullUrl);

        const response = await axios.get(fullUrl);

        // Validar status code
        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
        }

        // Validar estructura de respuesta
        const responseData = response.data as GetCoursesCategoryAPIResponse;
        if (!responseData.courses || !Array.isArray(responseData.courses)) {
            throw new Error('Respuesta del servidor inválida: estructura de datos incorrecta');
        }

        return responseData.courses;

    } catch (error) {
        console.error('Error en GetCourses:', error);
        throw error;
    }
}
