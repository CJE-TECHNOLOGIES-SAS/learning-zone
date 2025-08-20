import LoaderNotifications from "../../../../shared/animations/LoaderNotifications";
import "../styles/NotificationPanelTeacher.css";

import useNotificationsTeacher from "../hooks/useNotificationTeacher";
import NotificationItemTeacher from "./itemNotificationTeacher";
import { IoAddCircleSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { useState } from "react";
import CreateNotificationTeacher from "./CreateNotificationTeacher";

export default function NotificationPanelTeacher() {
  const {
    notificationsTeacher,
    loading,
    deleteAllNotificationsTeacher,
    refreshNotificationsTeacher
  } = useNotificationsTeacher();

  const [clickAddNotification, setClickAddNotification] = useState(false);

  const handleToggleForm = (): void => {
    refreshNotificationsTeacher()
    setClickAddNotification((prev) => !prev);

  };

  return (
    <div className="container-panel-notifications-teacher">
      {clickAddNotification ? (
        <>
          <CreateNotificationTeacher onToggleForm={handleToggleForm} />
          <div className="panel-header">
            <h2 className="title-container-notifications">
              Creando Notificacion...
            </h2>
            <div className="actions">
              <button
                className="btn-add-notification"
                onClick={handleToggleForm}
              >
                <IoAddCircleSharp />
              </button>

              <button
                className="btn-delete-all"
                disabled={loading || notificationsTeacher.length === 0}
                onClick={deleteAllNotificationsTeacher}
              >
                <MdDelete/>
              </button>
            </div>
          </div>
          {notificationsTeacher.length > 0 ? (
            <div className="container-items" style={{ backgroundColor: "#10101" }}>
              {notificationsTeacher.map((n) => (
                <NotificationItemTeacher key={n.id} notification={n} />
              ))}
              {loading && <LoaderNotifications />}
            </div>
          ) : (
            <h3>No hay notificaciones</h3>
          )}
        </>
      ) : (
        <>
          <div className="panel-header">
            <h2 className="title-container-notifications">
              Mis Notificaciones
            </h2>
            <div className="actions">
              <button
                className="btn-add-notification"
                onClick={handleToggleForm}
              >
                <IoAddCircleSharp />
              </button>

              <button
                className="btn-delete-all"
                disabled={loading || notificationsTeacher.length === 0}
                onClick={deleteAllNotificationsTeacher}
              >
                <MdDelete/>
              </button>
            </div>
          </div>
          {notificationsTeacher.length > 0 ? (
            <div className="container-items" style={{ backgroundColor: "#10101" }}>
              {notificationsTeacher.map((n) => (
                <NotificationItemTeacher key={n.id} notification={n} />
              ))}
              {loading && <LoaderNotifications />}
            </div>
          ) : (
            <h3>No hay notificaciones</h3>
          )}
        </>
      )}
    </div>
  );
}
