/* Servicio que envía la creación de notificación del profesor al backend */

import axios from "../../../../api/axiosInstance";

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;
// Ej: "/api/v1/teacher/notifications"

type TCreateNotificationDTO = {
  title: string;
  message: string; // Lo recibes del formulario
};

type TCreateNotificationResponse = {
  notification_id: number;
  message: string;
};

export const createNotificationAPI = async (
  payload: TCreateNotificationDTO
): Promise<TCreateNotificationResponse> => {
  try {
    const response = await axios.post(
      `${VITE_TEACHER_ENDPOINT}/notifications/`,
      payload
    );
    console.log(response)

    if (response.status !== 201 && response.status !== 200) {
      throw new Error("Error al crear la notificación");
    }

    return response.data as TCreateNotificationResponse;
  } catch (error) {
    console.error("Error en createNotificationAPI", error);
    throw error;
  }
};
