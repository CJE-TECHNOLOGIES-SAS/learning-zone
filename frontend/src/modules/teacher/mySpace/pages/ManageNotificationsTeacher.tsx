/* Componente que tendra el panel de notificaciones */
import NotificationPanelTeacher from '../../notificationsTeacher/components/PanelNotificationsTeacher'
import '../styles/ManageNotificationsTeacher.css'
export default function ManageNotificationsTeacher() {
  return (
    <div className='container-page-notifications-teacher'>
        {/* Panel de notificaciones */}
        <h2 className='title-container-notifications'>Gestion de notificaciones</h2>
        <NotificationPanelTeacher/>
        {/* Agregar mas opciones a futuro */}

    </div>
  )
}
