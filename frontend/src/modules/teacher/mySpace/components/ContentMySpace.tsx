/* Component that contains the logic for rendering views */
// src/modules/teacher/mySpace/pages/components/ContentMySpace.tsx

import { useMySpace } from "../hooks/useMySpace";
import ManageNotificationsTeacher from "../pages/ManageNotificationsTeacher";
import ManageStudentsTeacher from "../pages/ManageStudents";
import '../styles/ContentMySpace.css'



function StudentsView() {
  return (
    <div className="view-myspace students-view">
      <ManageStudentsTeacher />
    </div>
  );
}

function NotificationsView() {
  return (
    <div
      className="view-myspace notifications-view">
      <ManageNotificationsTeacher />
    </div>
  );
}

export default function ContentMySpace() {
  const { view } = useMySpace();

  // Switch the view depending on the sidebar selection
  return (
    <div className="content-my-space">
      {(() => {
        switch (view) {
          case "estudiantes":
            return <StudentsView />;
          case "notificaciones":
            return <NotificationsView />;
          default:
            return null;
        }
      })()}
    </div>
  );
}
