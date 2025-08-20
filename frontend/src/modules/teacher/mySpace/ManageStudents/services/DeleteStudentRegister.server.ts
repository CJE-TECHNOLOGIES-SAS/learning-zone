// src/modules/teacher/mySpace/services/students/DeleteIdentificationNumber.server.ts
import axios from '../../../../../api/axiosInstance';

// Respuesta esperada del backend
type TDeleteIdentificationNumberAPIResponse = {
  status: number;
  message: string;
};

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;

/**
 * Elimina un número de identificación de estudiante.
 * - Si pasas `numberIdentification`, elimina ese número específico vía query string.
 * - Si NO lo pasas, el backend decidirá el comportamiento (por ejemplo, no hacer nada o limpiar todos).
 */
export default async function DeleteIdentificationNumberAPI(
  id?: number
): Promise<TDeleteIdentificationNumberAPIResponse> {
  try {
    const baseUrlID = `${VITE_TEACHER_ENDPOINT}/students/identification`;
    const baseUrlDeleteALL = `${VITE_TEACHER_ENDPOINT}/students/identifications`;
    const url = typeof id === 'number'
      ? `${baseUrlID}/${id}`
      : baseUrlDeleteALL;

    const response = await axios.delete(url);

    return {
      status: response.status,
      message: response.data?.message || 'Número de identificación eliminado',
    };
  } catch (error) {
    console.error('Error en DeleteIdentificationNumberAPI:', error);
    throw error;
  }
}
