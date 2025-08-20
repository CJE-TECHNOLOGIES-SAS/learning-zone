import axios from '../../../../../api/axiosInstance';
import type { TStudentsRegisters } from '../ManageStudents';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;
type GetInfoRegisterStudentsAPIResponse = {
  status: number;
  message: string;
  students: TStudentsRegisters;
};
export default async function GetInfoRegisterStudentsAPI():Promise<GetInfoRegisterStudentsAPIResponse['students']> {
    try{
        const response = await axios.get(`${VITE_TEACHER_ENDPOINT}/students/identifications`)
        console.log(response)
        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
        }
       /*  console.log(response.data)
        const responseData = response.data as GetInfoRegisterStudentsAPIResponse; */
/*         if (!responseData || typeof responseData !== "object") {
            throw new Error("Respuesta del servidor inválida: datos del profesor no presentes");
        } */
        return response.data

    }catch (error) {
        console.error('Error en GetCoursesByCategoryTeacher:', error);
        throw error;
    }


}
