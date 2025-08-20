/* agregar consulta al backend del rol y retornarlo */
import React, { useEffect, useState } from "react";
import { UserContext } from "./userContext";
import { authStorage } from "../../../shared/Utils/authStorage";
import type { TUser, TUserRole } from "../../types/User";
import { useNavigationHandler } from "../../../hooks/useNavigationHandler";
import { GetStudentAPI } from "../Services/GetInformationStudent.server";
import toast from "react-hot-toast";
import { GetRoleUserAPI } from "../Services/GetRoleUser.server";
import { GetTeacherAPI } from "../Services/GetInformationTeacher.server";
import type { TNotificationsStudent } from "../../notifications/types/Notifications";

// Props que recibe el Provider
type Props = {
  children: React.ReactNode;
};

// Provider principal que controla la sesión de cualquier usuario (estudiante o maestro)
export const UserProvider = ({ children }: Props) => {
  const handleBtnNavigate = useNavigationHandler();

  // Estado para el usuario actual (estudiante o maestro)
  const [user, setUser] = useState<TUser | null>(null);
  const [role, setRole] = useState<TUserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<TNotificationsStudent>([]);
  const [isReady, setIsReady] = useState(false);

  /**
   * initSession
   * -----------
   * Sincroniza el estado global del usuario después del login exitoso.
   * Lee el token desde localStorage, obtiene el rol desde el backend,
   * y carga la información correspondiente del usuario y sus notificaciones.
   * Esta función debe llamarse inmediatamente después de guardar el token.
   */
const initSession = async (): Promise<boolean> => {
  const storedToken = authStorage.getToken();
  if (!storedToken) return false;

  try {
    const roleUser = await GetRoleUserAPI();
    authStorage.setRole(roleUser);
    setRole(roleUser);
    alert(roleUser)

    if (roleUser === "student") {
      const data = await GetStudentAPI();
      const userData: TUser = {
        id: data.id,
        numIdentification: data.identification_number,
        name: data.names,
        lastNames: data.last_names,
        email: data.email,
        prefixProfile: data.prefix_profile
      };
      authStorage.setUser(userData);
      setUser(userData);
    }else if(roleUser === 'teacher') {
      const data = await GetTeacherAPI();
      console.log(data.email)
      const userData: TUser = {
        id: data.id,
        name: data.names,
        lastNames: data.last_names,
        email: data.email,
        specialization: data.specialization,
        prefixProfile: data.prefix_profile
      };
      authStorage.setUser(userData);
      setUser(userData);
    }

/*     const userNotifications = await GetNotificationsAPI();
    authStorage.setNotifications(userNotifications);
    setNotifications(userNotifications);
 */
    return true;

  } catch (error) {
    console.error("Error al inicializar sesión:", error);
    return false;
  }
};

  // Carga inicial: verifica si hay sesión guardada o incompleta
  useEffect(() => {
    const storedToken = authStorage.getToken();
    const storedUser = authStorage.getUser();
    const storedNotifications = authStorage.getNotificationsStudent();
    const storedRole = authStorage.getRole();

    // Si hay token pero no se ha cargado toda la información, ejecutar initSession
    if (storedToken && (!storedUser || !storedRole)) {
      initSession();
    }

    // Si ya todo está guardado, restaurar directamente al contexto
    if (storedUser && storedToken && storedNotifications && storedRole) {
      setUser(storedUser);
      setToken(storedToken);
      setNotifications(storedNotifications);
      setRole(storedRole);
    }

    setIsReady(true);
  }, []);

  // Verifica si el usuario está logueado
  const isLoggedIn = !!user && !!role;

  // Cierra sesión y limpia todo
  const logout = () => {
    authStorage.removeToken();
    authStorage.removeUser();
    authStorage.removeNotificationsStudent();
    authStorage.removeCoursesStudent();

    setUser(null);
    setRole(null);
    setToken(null);
    setNotifications([]);
    authStorage.removeRole()

    toast.success("Sesión cerrada");
    handleBtnNavigate("/");
  };

  const numberNotifications = notifications.length;

  return (
    <UserContext.Provider
      value={{
        user,
        role,
        token,
        logout,
        isLoggedIn,
        isReady,
        setUser,
        setToken,
        setRole,
        setNotifications,
        notifications,
        numberNotifications,
        initSession // Se expone al contexto para uso posterior
      }}
    >
      {isReady ? children : null}
    </UserContext.Provider>
  );
};
