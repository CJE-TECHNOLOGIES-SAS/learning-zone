// ✅ Importa el ícono de eliminar
import { MdDelete } from "react-icons/md";
import { useState } from "react";

// ✅ Hook del profe (sin polling) para eliminar

// ✅ Estilos (puedes reutilizar los del student o crear unos del teacher)
import "../styles/NotificationItemTeacher.css";

// ✅ Tipo de notificación (igual al payload que retorna el backend)
import type { TNotification } from "../../../notifications/types/Notifications";
import useNotificationsTeacher from "../hooks/useNotificationTeacher";

// ✅ Props
type TNotificationItemTeacherProps = {
  notification: TNotification;
};

export default function NotificationItemTeacher({ notification }: TNotificationItemTeacherProps) {
  const { deleteItemNotificationTeacher, loading } = useNotificationsTeacher();

  const [showFull, setShowFull] = useState(false);
  const maxLength = 120;
  const isLong = notification.message.length > maxLength;
  const toggleShow = () => setShowFull((prev) => !prev);

  return (
    <div className="container-notification">
      <div className="header-notification">
        <h2 className="title-notification">{notification.title}</h2>
        <span className="date-notification">{notification.date}</span>
      </div>

      <div className="body-notification">
        <p className="message-notification">
          {showFull || !isLong
            ? notification.message
            : notification.message.slice(0, maxLength) + "..."}
          {isLong && (
            <button onClick={toggleShow} className="btn-toggle-message">
              {showFull ? "Ver menos" : "Ver más"}
            </button>
          )}
        </p>

        <button
          className="btn-delete-notification"
          disabled={loading}
          onClick={() => deleteItemNotificationTeacher(notification.id)}
          title="Eliminar notificación"
        >
          <MdDelete />
        </button>
      </div>
    </div>
  );
}
