/* Component that contains the logic for rendering views */
// src/modules/teacher/mySpace/pages/components/ContentMySpace.tsx

import { useMySpace } from "../hooks/useMySpace";
import ManageContents from "../pages/ManageContents";
import ManageNotificationsTeacher from "../pages/ManageNotificationsTeacher";
import ManageStudentsTeacher from "../pages/ManageStudents";
import '../styles/ContentMySpace.css'

// Replace these placeholders with your actual components
function UserView() {
  return (
    <div className="view-myspace user-view">
      <ManageContents />
    </div>
  );
}

function StudentsView() {
  return (
    <div className="view-myspace students-view">
      <ManageStudentsTeacher />
    </div>
  );
}

function StatisticsView() {
  return (
    <div className="view-myspace statistics-view">
      Course statistics
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
          case "usuario":
            return <UserView />;
          case "estudiantes":
            return <StudentsView />;
          case "estadisticas":
            return <StatisticsView />;
          case "notificaciones":
            return <NotificationsView />;
          default:
            return null;
        }
      })()}
    </div>
  );
}
