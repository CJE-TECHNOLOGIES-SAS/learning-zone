import { Routes, Route } from "react-router-dom";
import AuthLayout from "../shared/Layouts/AuthLayout";
import PrivateRouters from "./PrivateRouters";
import { sharedRoutes } from "./SharedRouters";
import TeacherRoutes from "./TeacherRoutes";
import StudentRoutes from "./StudentRoutes";
import RoleRedirect from "./RoleRedirect";
import { StudentGuard, TeacherGuard } from "./RoleGuard";
import { TeacherCourseProvider } from "../modules/teacher/context/TeacherCourseProvider";
import { StudentCourseProvider } from "../modules/courses/context/StudentCourseProvider";
import LandingPage from "../pages/LandingPage";
import Help from "../pages/Help";

export default function RoutersPrivates() {
  return (
    <Routes>
      {/* Wrapper general que protege todas las rutas privadas */}
      <Route element={<PrivateRouters />}>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<LandingPage />} />


          {/* Redirección inicial según el rol */}
          <Route path="/redirect" element={<RoleRedirect />} />

          {/* Rutas protegidas para profesores */}
          <Route element={<TeacherGuard />}>
            <Route
              path="/teacher/*"
              element={
                <TeacherCourseProvider>
                  <TeacherRoutes />
                </TeacherCourseProvider>
              }
            />
          </Route>

          {/* Rutas protegidas para estudiantes */}
          <Route element={<StudentGuard />}>
            <Route path="/student/*" element={
              <StudentCourseProvider>
                <StudentRoutes />
              </StudentCourseProvider>
            } />
          </Route>
          <Route path="/help" element={<Help />} />

          {/* Rutas compartidas (pueden estar protegidas) */}
          {sharedRoutes}

        </Route>
      </Route>
    </Routes>
  );
}
