import axios from '../../../../../api/axiosInstance';
import type { TStudentsRegisters } from '../ManageStudents';
const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;


/**
 * Tipo de respuesta esperada desde el backend
 */
type GetSingleStudentAPIResponse = {
  status: number;
  message: string;
  student: TStudentsRegisters[number]; // Un solo estudiante
};
export default async function GetSingleStudentAPI(n_identification: number): Promise<GetSingleStudentAPIResponse['student']> {
  try {
    // Llamada al endpoint del backend con el ID del estudiante
    const response = await axios.get(`${VITE_TEACHER_ENDPOINT}/students/identification/by-number/${n_identification}`);

    // Validar el status HTTP
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
    }

    // Validar y castear los datos recibidos
/*     const responseData = response.data as GetSingleStudentAPIResponse;
    if (!responseData || typeof responseData !== 'object') {
      throw new Error('Respuesta del servidor inválida: datos del estudiante no presentes');
    } */

    return response.data;
  } catch (error) {
    console.error('Error en GetSingleStudentAPI:', error);
    throw error;
  }
}
