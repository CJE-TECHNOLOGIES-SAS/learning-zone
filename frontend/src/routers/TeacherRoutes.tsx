/**
 * 👨‍🏫 TeacherRoutes.tsx - Rutas Específicas para Maestros
 *
 * Define todas las rutas que solo pueden acceder los maestros.
 * Protegidas por TeacherGuard en el archivo principal de rutas.
 */

import { Routes, Route } from "react-router-dom";

// Importaciones de páginas de maestro
import CourseManagement from "../modules/teacher/pages/CourseManagement";

import TeacherHome from "../modules/teacher/pages/TeacherHome";
import LessonEditor from "../modules/teacher/components/LessonEditor";
import LessonCreate from "../modules/teacher/components/LessonCreator";
import TeacherDashboard from "../modules/teacher/components/TeacherDashboard";
import CourseCreator from "../modules/teacher/components/CourseCreator";
import CourseEdit from "../modules/teacher/components/CourseEdit";
import HelpTeacher from "../pages/HelpTeacher";
import CreateNotificationTeacher from "../modules/teacher/notificationsTeacher/components/CreateNotificationTeacher";
import MySpace from "../modules/teacher/mySpace/pages/MySpace";

// COMPONENTE PRINCIPAL
/**
 * TeacherRoutes - Rutas específicas para maestros
 *
 * Organiza todas las rutas por categorías:
 * - Dashboard
 * - Gestión de cursos
 * - Creación de contenido
 * - Gestión de estudiantes
 * - Notificaciones
 * - Configuración
 */
export default function TeacherRoutes() {
  return (
    <Routes>
      {/* Home */}
      <Route path="home-teacher" element={<TeacherDashboard />} /> {/* Page del teacher */}
      <Route path="help-teacher" element={<HelpTeacher />} />


      {/* Gestión de cursos */}
      <Route path="/courses" element={<TeacherHome />} />
      <Route path="/courses/create" element={<CourseCreator/>} />
      <Route path="/courses/:courseId" element={<CourseManagement/>} />
      <Route path="/courses/:courseId/edit" element={<CourseEdit />} />

      <Route path="courses/:courseId/lessons/create" element={<LessonCreate />} />
      <Route path="courses/:courseId/lessons/:lessonId/edit" element={<LessonEditor/>}/>
      <Route path="/myspace" element={<MySpace/>}/>



      {/* Analytics y reportes */}
 {/*      <Route path="/analytics" element={<Analytics />} />
      <Route path="/reports" element={<div>Reportes</div>} />
       */}
      {/* Notificaciones */}
      <Route path="/notifications/create" element={<CreateNotificationTeacher/>} />

      {/* Configuración */}
      <Route path="/profile" element={<div>Perfil del maestro</div>} />
      <Route path="/settings" element={<div>Configuración</div>} />
    </Routes>
  );
}
