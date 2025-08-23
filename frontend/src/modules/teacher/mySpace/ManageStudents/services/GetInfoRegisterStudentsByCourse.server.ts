
import axios from '../../../../../api/axiosInstance';
import type { TCourse } from '../../../../courses/types/CourseStudent';
import type { TStudentsRegisters } from '../ManageStudents';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;
type GetInfoRegisterStudentsAPIResponse = {
  status: number;
  message: string;
  students: TStudentsRegisters;
};
export default async function GetInfoRegisterStudentsByCourseAPI(id_course:TCourse['id']):Promise<GetInfoRegisterStudentsAPIResponse['students']> {
    try{
        const response = await axios.get(`${VITE_TEACHER_ENDPOINT}/courses/${id_course}/students`)
        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
        }
        const responseData = response.data as GetInfoRegisterStudentsAPIResponse;
         if (!responseData || typeof responseData !== "object") {
            throw new Error("Respuesta del servidor inválida: datos del profesor no presentes");
        }
        return responseData.students

    }catch (error) {
        console.error('Error en GetInfoRegisterStudentsByCourseAPI:', error);
        throw error;
    }


}
