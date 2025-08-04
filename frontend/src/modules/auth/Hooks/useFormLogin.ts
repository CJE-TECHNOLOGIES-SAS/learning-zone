import { useState } from "react";
import { useNavigationHandler } from "../../../hooks/useNavigationHandler";
import type { TStudent } from "../../types/User";
import { loginAPI } from "../Services/Login.server";
import { authStorage } from "../../../shared/Utils/authStorage";
import toast from "react-hot-toast";
import { useUser } from "../../auth/Hooks/useAuth"; // Hook para acceder a initSession

export default function useFormLogin() {
  // --- Tipos utilizados para formularios y errores ---
  type LoginForm = Pick<TStudent, "email" | "password">;
  type FormErrors = Partial<Record<keyof LoginForm, string>>;

  // --- Estados del formulario ---
  const [email, setEmail] = useState<TStudent['email']>('');               // Email ingresado por el usuario
  const [password, setPassword] = useState<TStudent['password']>('');     // Contraseña ingresada por el usuario
  const [showPassword, setShowPassword] = useState(false);                // Mostrar u ocultar contraseña
  const [errors, setErrors] = useState<FormErrors>({});                   // Errores de validación
  const [loading, setLoading] = useState(false);                          // Estado de carga (loading spinner)
  const [viewSucessMessage, setViewSucessMessage] = useState(false);      // Mostrar mensaje de éxito (opcional)

  const handleBtnNavigate = useNavigationHandler();                       // Hook personalizado para navegación SPA
  const { initSession } = useUser();                                      // Función global para cargar usuario y rol

  // --- Alternar visibilidad de contraseña ---
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // --- Mensajes de error reutilizables ---
  const ERROR_MESSAGES = {
    required: (field: string) => `El ${field} es obligatorio.`,
    invalidEmail: "El formato del correo electrónico no es válido.",
  };

  // --- Validaciones unitarias ---
  const isRequired = (value: string): boolean => value.trim().length > 0;
  const isValidEmail = (email: string): boolean =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

  // --- Validación completa del formulario ---
  const validateForm = (form: LoginForm): FormErrors => {
    const errors: FormErrors = {};

    // Validar email
    if (!isRequired(form.email)) {
      errors.email = ERROR_MESSAGES.required("correo electrónico");
    } else if (!isValidEmail(form.email)) {
      errors.email = ERROR_MESSAGES.invalidEmail;
    }

    // Validar contraseña
    if (!isRequired(form.password)) {
      errors.password = ERROR_MESSAGES.required("contraseña");
    }

    return errors;
  };

  // --- Manejador del envío del formulario de login ---
  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evita recarga por defecto del navegador

    const formData: LoginForm = { email, password };
    const validationErrors = validateForm(formData); // Validar campos

    // Si hay errores, detener envío y mostrarlos
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true); // Activar estado de carga mientras se llama al backend

    try {
      // --- Llamar al servicio loginAPI (con correo y contraseña) ---
      const response = await loginAPI(formData);

      if (!response) {
        toast.error("Credenciales incorrectas.");
        return;
      }

      // --- Guardar token recibido en localStorage ---
      authStorage.setToken(response.access_token);

      // --- Inicializar sesión global: carga rol, datos y notificaciones ---
      await initSession();

      // --- Redirigir a "/", que se encargará de llevar a /student o /teacher según el rol ---
      handleBtnNavigate("/");

    } catch (err) {
      toast.error("No se pudo iniciar sesión.");
    } finally {
      setLoading(false); // Finalizar carga en cualquier caso
    }
  };

  // --- Exportar API del hook ---
  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleBtnNavigate,
    togglePasswordVisibility,
    handleSubmitLogin,
    loading,
    errors,
    viewSucessMessage,
  };
}
