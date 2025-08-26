import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authStorage } from "../shared/Utils/authStorage"; // Asegúrate de que esta funcione correctamente

export default function RoleRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Opción 1: desde localStorage directamente
    const role = authStorage.getRole(); // "teacher" | "student" | undefined/nullclg
    if (role === "teacher") {
      navigate("/teacher/home-teacher", { replace: true });
    } else if (role === "student") {
      navigate("/student/home-student", { replace: true });
    } else {
      // Si no hay rol, redirige al landing
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null; // No renderiza nada, solo redirecciona
}
