/* Servicio que solicita los cursos para filtrar */
import axios from '../../../../../api/axiosInstance';
import type { TCoursesFilter } from '../ManageStudents';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;
type GetInfoRegisterStudentsAPIResponse = {
  status: number;
  message: string;
  courses: TCoursesFilter;
};
export default async function GetCoursesFilterAPI():Promise<GetInfoRegisterStudentsAPIResponse['courses']> {
    try{
/*         const response = await axios.get(`${VITE_TEACHER_ENDPOINT}/students/courses`) */
        const response = await axios.get(`${VITE_TEACHER_ENDPOINT}/courses/published`)
        console.log(response)
        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
        }
       /*  console.log(response.data)
        const responseData = response.data as GetInfoRegisterStudentsAPIResponse; */
/*         if (!responseData || typeof responseData !== "object") {
            throw new Error("Respuesta del servidor inválida: datos del profesor no presentes");
        } */
       console.log('object', response.data)
        return response.data

    }catch (error) {
        console.error('Error en GetCoursesFilterAPI:', error);
        throw error;
    }


}
