import { Routes, Route } from "react-router-dom";
import AuthLayout from "../shared/Layouts/AuthLayout";
import PrivateRouters from "./PrivateRouters";
import { sharedRoutes } from "./SharedRouters";
import TeacherRoutes from "./TeacherRoutes";
import StudentRoutes from "./StudentRoutes";
import RoleRedirect from "./RoleRedirect";
import { StudentGuard, TeacherGuard } from "./RoleGuard";
import { TeacherCourseProvider } from "../modules/teacher/context/TeacherCourseProvider";

export default function RoutersPrivates() {
  return (
    <Routes>
      {/* Wrapper general que protege todas las rutas privadas */}
      <Route element={<PrivateRouters />}>
        <Route element={<AuthLayout />}>

          {/* Redirección inicial según el rol */}
          <Route path="/" element={<RoleRedirect />} />

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
            <Route path="/student/*" element={<StudentRoutes />} />
          </Route>

          {/* Rutas compartidas (pueden estar protegidas) */}
          {sharedRoutes}

        </Route>
      </Route>
    </Routes>
  );
}
