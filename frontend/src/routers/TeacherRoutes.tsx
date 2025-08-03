/**
 * 👨‍🏫 TeacherRoutes.tsx - Rutas Específicas para Maestros
 *
 * Define todas las rutas que solo pueden acceder los maestros.
 * Protegidas por TeacherGuard en el archivo principal de rutas.
 */

import { Routes, Route } from "react-router-dom";

// Importaciones de páginas de maestro
import CourseManagement from "../modules/teacher/pages/CourseManagement";
import StudentProgress from "../modules/teacher/pages/StudentProgress";
import NotificationCenter from "../modules/teacher/pages/NotificationCenter";
import TeacherHome from "../modules/teacher/pages/TeacherHome";
import LessonEditor from "../modules/teacher/components/LessonEditor";
import LessonCreate from "../modules/teacher/components/LessonCreator";

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
      <Route path="/home-teacher" element={<TeacherHome />} /> {/* Page del teacher */}
      <Route path="/profile-teacher" element={<TeacherPage/>}/> {/* Perfil del profesor */}


      {/* Gestión de cursos */}
      <Route path="/courses" element={<TeacherHome />} />
      <Route path="/courses/create" element={<div>Crear nuevo curso</div>} />
      <Route path="/courses/:courseId" element={<CourseManagement/>} />
      <Route path="/courses/:courseId/edit" element={<div>Gestionar lecciones</div>} />

      <Route path="courses/lessons/create" element={<LessonCreate />} />
      <Route path="courses/:courseId/lessons/:lessonId/edit" element={<LessonEditor/>}/>

      {/* Gestión de estudiantes */}
      <Route path="/students" element={<div>Lista de estudiantes</div>} />
      <Route path="/students/:studentId" element={<div>Perfil del estudiante</div>} />
      <Route path="/progress" element={<StudentProgress />} />

      {/* Analytics y reportes */}
 {/*      <Route path="/analytics" element={<Analytics />} />
      <Route path="/reports" element={<div>Reportes</div>} />
       */}
      {/* Notificaciones */}
      <Route path="/notifications" element={<NotificationCenter />} />
      <Route path="/notifications/create" element={<div>Crear notificación</div>} />

      {/* Configuración */}
      <Route path="/profile" element={<div>Perfil del maestro</div>} />
      <Route path="/settings" element={<div>Configuración</div>} />
    </Routes>
  );
}
