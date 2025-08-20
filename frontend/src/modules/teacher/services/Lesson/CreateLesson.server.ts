/* Servicio encargado de crear una leccion */

/* Servicio que solicita los cursos de una categoria en especifico */
/* Serivicio que se encarga de obtener los cursos del estudiante */

import axios from '../../../../api/axiosInstance';
import type { TCourse } from '../../../courses/types/CourseStudent';
import type { TLessonContentResponse, TLessonTeacherResponse } from '../../types/Teacher';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;

// Tipo para la respuesta esperada según el estándar
type TCreateLessonAPIResponse={
    status:number
    message: string;
    data :{
        id: TLessonTeacherResponse['id'];
        name:TLessonTeacherResponse['name']
    }
};

type TCreateLessonAPIProps = {
  idCourse:TCourse['id'],
  lessonContent:TLessonContentResponse

};


export default async function CreateLessonAPI({
  idCourse,
  lessonContent,
}: TCreateLessonAPIProps): Promise<TCreateLessonAPIResponse['data']> {
  try {
    const formData = new FormData();
    formData.append("name", lessonContent.name);
    formData.append("content_type", lessonContent.content.content_type);
    formData.append("text", lessonContent.content.text);
    if (lessonContent.content.file) {
      formData.append("file", lessonContent.content.file);
    }

    const response = await axios.post(
      `${VITE_TEACHER_ENDPOINT}/courses/${idCourse}/lessons`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log(response);

    // Validar status code
    if (response.status !== 200) {
      throw new Error(
        `HTTP ${response.status}: ${response.data?.message || "Error desconocido"}`
      );
    }

    // Validar estructura de respuesta
   /*  const responseData = response.data as TCreateLessonAPIResponse; */
   /*  if (!responseData || !Array.isArray(responseData.message)) {
      throw new Error(
        "Respuesta del servidor inválida: estructura de datos incorrecta"
      );
      } */
      console.log(response)

    return response.data;
  } catch (error) {
    console.error("Error en createLesson:", error);
    throw error;
  }
}
