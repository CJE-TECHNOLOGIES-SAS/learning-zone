
// src/modules/teacher/mySpace/services/students/UpdateStudentIdentification.server.ts
import axios from '../../../../../api/axiosInstance';
import type { TStudentRegisterResponse } from '../ManageStudents';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;

// Tipo de respuesta esperado (tu backend retorna status y message)
type TUpdateIdentificationAPIResponse = {
  status: number;
  message: string;
};

export default async function UpdateStudentIdentificationAPI(
  id: number,
  new_number_identification: TStudentRegisterResponse['number_identification']

): Promise<TUpdateIdentificationAPIResponse['status']> {
  try {
    alert(new_number_identification)

    const response = await axios.put(
      `${VITE_TEACHER_ENDPOINT}/students/identification/${id}`,
      {new_number_identification}
    );

    if (response.status !== 200) {
      throw new Error(
        `HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`
      );
    }
    const responseData = response.data as TUpdateIdentificationAPIResponse;
    return responseData.status;
  } catch (error) {
    console.error('Error en UpdateStudentIdentificationAPI:', error);
    throw error;
  }
}
