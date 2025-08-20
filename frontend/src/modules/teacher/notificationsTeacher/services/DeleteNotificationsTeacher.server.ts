/* Servicio que elimina notificaciones del profesor (una o todas) */
import axios from '../../../../api/axiosInstance';
import type { TNotification } from '../../../notifications/types/Notifications';

type TDeleteNotificationTeacherResponse = {
  status: number;
  message: string;
};

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;
// Ej.: "/api/v1/teacher"

export default async function DeleteNotificationTeacherAPI(
  idNotification?: TNotification['id']
): Promise<TDeleteNotificationTeacherResponse> {
  try {
    const base = `${VITE_TEACHER_ENDPOINT}/notifications/`;
    const url = typeof idNotification === 'number'
      ? `${base}?id_notification=${idNotification}`
      : base;

    const response = await axios.delete(url);

    return {
      status: response.status,
      message:
        response.data?.message ||
        (idNotification ? 'Notificación eliminada' : 'Notificaciones eliminadas'),
    };
  } catch (error) {
    console.error('Error en DeleteNotificationTeacherAPI:', error);
    throw error;
  }
}
