/* Componente de page de gestion de estudiantes */
/* Componente que tendra el panel de notificaciones */
import PanelManageStudent from '../ManageStudents/components/PanelManageStudent'
import { ManageStudentsProvider } from '../ManageStudents/Context/ManageStudentsProvider'
import '../styles/ManageStudents.css'
export default function ManageStudentsTeacher() {
  return (
    <ManageStudentsProvider>
        <div className='container-page-manage-students-teacher'>
            {/* Panel de notificaciones */}
            <h2 className='title-container-manage-students'>Gestion de Estudiantes</h2>

            <PanelManageStudent/>
            {/* Agregar mas opciones a futuro */}

        </div>

    </ManageStudentsProvider>

  )
}
