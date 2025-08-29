import axios from '../../../../api/axiosInstance';
import type { TCourseTeacherResponse, TCourseTeacherSend } from '../../types/Teacher';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;

// Tipo para la respuesta esperada según el estándar
type TCreateLessonAPIResponse = {
  status: number;
  message: string;
  id_course: TCourseTeacherResponse['id'];
};

export default async function CreateCourseAPI(course: TCourseTeacherSend): Promise<TCourseTeacherResponse['id']> {
  try {
    const formData = new FormData();
    formData.append("name", course.name);
    formData.append("description", course.description);
    formData.append("category", course.category);
    formData.append("name_palette", course.name_palette);
    formData.append("palette", JSON.stringify(course.palette));
    if (course.image) {
      formData.append("image", course.image);
    }

    const response = await axios.post(`${VITE_TEACHER_ENDPOINT}/courses`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
            // console.log(response)

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
    }

    const responseData = response.data as TCreateLessonAPIResponse;

    // 🔐 Validación corregida
    if (!responseData.id_course || typeof responseData.id_course !== "number") {
      throw new Error('Respuesta del servidor inválida: ID del curso no recibido correctamente');
    }

    return responseData.id_course;
  } catch (error) {
    console.error('Error en createCourses:', error);
    throw error;
  }
}
