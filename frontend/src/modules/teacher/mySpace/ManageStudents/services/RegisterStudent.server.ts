import axios from '../../../../../api/axiosInstance';
import type { TStudentRegisterSend } from '../ManageStudents';
const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;
/* type RegisterStudentAPIResponse = {
    status: number;
    message: string;
}; */
export default async function RegisterStudentAPI(n_identification: TStudentRegisterSend['number_identification'])/* : Promise<RegisterStudentAPIResponse['status']>  */{
    try {
        const body = { n_identification }; // ← objeto, no el número suelto
        const response = await axios.post(`${VITE_TEACHER_ENDPOINT}/students/identification`, body);
        console.log(response)
        if (response.status !== 200 && response.status !== 201) {
            throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
        }
        /* const responseData = response.data as RegisterStudentAPIResponse; */
        return response.status;
    } catch (error) {
        console.error('Error en registerStudent:', error);
        throw error;
    }
}
