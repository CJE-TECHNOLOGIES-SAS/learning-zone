// src/modules/teacher/mySpace/services/students/RegisterStudentsByFile.server.ts
import axios from '../../../../../api/axiosInstance';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;

// Respuesta mínima que retorna tu backend
type TRegisterByFileAPIResponse = {
  status: number;
  message: string;
};

export default async function RegisterStudentsByFileAPI(file: File): Promise<TRegisterByFileAPIResponse['status']> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${VITE_TEACHER_ENDPOINT}/students/identifications`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
    }

    /* const responseData = response.data as TRegisterByFileAPIResponse; */

    return response.status;
  } catch (error) {
    console.error('Error en RegisterStudentsByFileAPI:', error);
    throw error;
  }
}
