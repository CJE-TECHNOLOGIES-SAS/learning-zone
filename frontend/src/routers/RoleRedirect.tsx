/**
 * Redirige automáticamente a los usuarios según su rol.
 */

import { Navigate } from "react-router-dom";
import { useUser } from "../modules/auth/Hooks/useAuth";

// COMPONENTE PRINCIPAL

/**
 * RoleRedirect - Redirección principal por roles
 *
 * Redirige según el rol del usuario después del login.
 */
export default function RoleRedirect() {
  const { user, role } = useUser();

  // Usuario no autenticado
  if (!user || !role) {
    return <Navigate to="/landing" replace />;
  }

  // Redirección según rol
  switch (role) {
    case "teacher":
      return <Navigate to="/teacher/home-teacher" replace />;

    case "student":
      return <Navigate to="/student/home-student" replace />;

    default:
      return <Navigate to="/landing" replace />;
  }
}

// ============================================================================
// REDIRECCIÓN DESDE PÁGINA PRINCIPAL
// ============================================================================

/**
 * HomeRoleRedirect - Redirección desde página principal
 *
 * Solo redirige si el usuario está logueado.
 * Si no está logueado, permite ver la página normal.
 */
export function HomeRoleRedirect() {
  const { user, role } = useUser();

  // Usuario no autenticado - no redirigir
  if (!user || !role) {
    return null;
  }

  // Redirección según rol
  switch (role) {
    case "teacher":
      return <Navigate to="/teacher/home-teacher" replace />;

    case "student":
      return <Navigate to="/student/home-student" replace />;

    default:
      return null;
  }
}
