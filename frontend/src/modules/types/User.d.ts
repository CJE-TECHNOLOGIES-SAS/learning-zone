import type { TNotifications, TNotificationsStudent } from "../notifications/types/Notifications";
/* Representa el modelo donde esta consentimiento  */
export type TStudentConsent ={
    accepted: boolean;
    timestamp: string;
    version: '1.0'
}
// Representa el modelo base de un estudiante (estructura completa, usada para registro o autenticación).
export type TStudent = {
  id: number;
  numIdentification: number;
  name: string;
  lastNames: string;
  email: string;
  password: string;
};

// Representa los datos mínimos que retorna el backend tras un login exitoso.
// Se suele guardar en localStorage o en un contexto de sesión.
export type TStudentProfileToken = {
  name: TStudent['name'];     // Nombre del usuario autenticado
  email: TStudent['email'];   // Email del usuario autenticado
  token: string;              // Token JWT usado para proteger las rutas privadas
};

// Define la estructura del perfil del estudiante visible en la interfaz.
// Excluye el password y el token.
// Ideal para mostrar datos del usuario en dashboards, encabezados o perfiles.
export type TStudentProfile = {
  id: TStudent['id'];
  numIdentification: TStudent['numIdentification'];
  name: TStudent['name'];
  lastNames: TStudent['lastNames'];
  email: TStudent['email'];
  prefixProfile: string; // Campo útil para mostrar iniciales, títulos o avatar textual
};

// ============================================================================
// TIPOS DE MAESTRO - NUEVOS
// ============================================================================


export type TTeacher = {
  name: string;
  email: string;
};

export type TTeacherProfileToken = {
  name: TTeacher['name'];
  email: TTeacher['email'];
  token: string;
};

export type TTeacherProfile = {
  id: TTeacher['id'];
  name: TTeacher['name'];
  email: TTeacher['email'];
  prefixProfile: string;
};

export type TUser = TStudentProfile | TTeacherProfile ;

export type TUserRole = 'student' | 'teacher';

export type TUserProfileToken = {
  name: string;
  email: string;
  token: string;
  role: TUserRole; // ← CAMPO NUEVO: Identifica el tipo de usuario
};

export type TUserContext = {
  // Cambio: 'student' → 'user' (más genérico)
  user: TUser | null;

  // ✅ NUEVO: Rol del usuario actual
  role: UserRole | null;

  // Mantiene: token, isLoggedIn, isReady, logout
  token: string | null;
  isLoggedIn: boolean;
  isReady: boolean;
  logout: () => void;

  // Cambios: Setters actualizados
  setUser: React.Dispatch<React.SetStateAction<TUser | null>>; // ← NUEVO
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setRole: React.Dispatch<React.SetStateAction<UserRole | null>>; // ← NUEVO

  // Mantiene: notificaciones
  notifications: TNotificationsStudent;
  setNotifications: React.Dispatch<React.SetStateAction<TNotifications>>;
  numberNotifications: number;
  initSession: ()=>Promise<boolean>

};
