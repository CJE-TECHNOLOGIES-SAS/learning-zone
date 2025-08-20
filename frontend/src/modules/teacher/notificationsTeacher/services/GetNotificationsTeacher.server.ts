/* Servicio: obtener todas las notificaciones creadas por el profesor */
import axios from '../../../../api/axiosInstance';
import type { TNotificationsTeacher } from '../../../notifications/types/Notifications';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;
// Ejemplo esperado: "/api/v1/teacher"

export async function GetTeacherNotificationsAPI(): Promise<TNotificationsTeacher> {
  try {
    const { data, status } = await axios.get<TNotificationsTeacher>(
      `${VITE_TEACHER_ENDPOINT}/notifications/`
    );
    if (status !== 200 && status !== 404) {
      throw new Error('Error al obtener notificaciones del profesor');
    }
    console.log(data)
    return data;
  } catch (error) {
    console.error('GetTeacherNotificationsAPI error', error);
    throw error;
  }
}
