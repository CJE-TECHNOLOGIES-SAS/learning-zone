// PARA MAYOR SEGURIDAD MIGRAR ESTO A COOKIES
// Importa los tipos de datos definidos para el usuario y su token
import type {
  TComment,
  TStudentAllComents,
} from "../../modules/courses/comments/types";
import type {
  TContent,
  TCoursesStudents,
  TEvaluation,
  TLessonsStudent,
  TLessonsTeacher,
  TLessonStudent,
} from "../../modules/courses/types/CourseStudent";
import type { TNotificationsStudent, TNotificationsTeacher } from "../../modules/notifications/types/Notifications";
import type { TStudentsRegisters } from "../../modules/teacher/mySpace/ManageStudents/ManageStudents";
import type {
  TCoursesTeachers,
  TCourseTeacherResponse,
  TFormDataLesson,
  TLessonTeacherResponse,
} from "../../modules/teacher/types/Teacher";
import type {
  TStudent,
  TStudentConsent,
  TStudentProfile,
  TStudentProfileToken,
  TUser,
  TUserRole,
} from "../../modules/types/User";
import type { TColorPalette } from "../theme/ColorPalettesCourses";

// Objeto que encapsula el acceso al almacenamiento local (localStorage)
export const authStorage = {
  setCookieConsentGiven: (consentObject: TStudentConsent) =>
    localStorage.setItem("cookieConsentGiven", JSON.stringify(consentObject)),

  getCookieConsentGiven: (): TStudentConsent | null => {
    try {
      const raw = localStorage.getItem("cookieConsentGiven");
      return raw ? (JSON.parse(raw) as TStudentConsent) : null;
    } catch (e) {
      console.error("El JSON está mal formado :", e);
      return null;
    }
  },
  removeCookieConsentGiven: () => localStorage.removeItem("CookieConsentGiven"),

  // ============================================================================
  // USUARIO UNIFICADO (ESTUDIANTE O MAESTRO)
  // ============================================================================

  // Guarda el usuario unificado (estudiante o maestro)
  setUser: (user: TUser) => localStorage.setItem("user", JSON.stringify(user)),

  // Recupera el usuario unificado desde localStorage
  getUser: (): TUser | null => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? (JSON.parse(raw) as TUser) : null;
    } catch (e) {
      console.error("El JSON está mal formado :", e);
      return null;
    }
  },

  // Elimina el usuario del localStorage
  removeUser: () => localStorage.removeItem("user"),

  // ============================================================================
  // ROL DEL USUARIO
  // ============================================================================

  // Guarda el rol del usuario
  setRole: (role: TUserRole) => localStorage.setItem("role", role),

  // Recupera el rol del usuario desde localStorage
  getRole: (): TUserRole | null => {
    const role = localStorage.getItem("role");
    return role as TUserRole | null;
  },

  // Elimina el rol del localStorage
  removeRole: () => localStorage.removeItem("role"),

  // Elimina el usuario del localStorage (compatibilidad)
  removeStudent: () => localStorage.removeItem("student"),

  setAllStudents: (allStudents: TStudentAllComents[]) =>
    localStorage.setItem("allStudents", JSON.stringify(allStudents)),
  getAllStudents: (): TStudentAllComents[] | null => {
    try {
      const raw = localStorage.getItem("allStudents");
      return raw ? (JSON.parse(raw) as TStudentAllComents[]) : null;
    } catch (e) {
      console.error("El JSON está mal formado :", e);
      return null;
    }
  },
  removeAllStudents: () => localStorage.removeItem("allStudents"),

  setComments: (comments: TComment[]) =>
    localStorage.setItem("comments", JSON.stringify(comments)),
  getComments: (): TComment[] | null => {
    try {
      const raw = localStorage.getItem("comments");
      return raw ? (JSON.parse(raw) as TComment[]) : null;
    } catch (e) {
      console.error("El JSON está mal formado :", e);
      return null;
    }
  },
  removeComments: () => localStorage.removeItem("comments"),

  // Guarda el token de autenticación
  setToken: (token: TStudentProfileToken["token"]) =>
    localStorage.setItem("token", token),

  getToken: (): string | null => localStorage.getItem("token"),

  removeToken: () => localStorage.removeItem("token"),

  // Token de request email
  setRequestEmailToken: (token: TStudentProfileToken["token"]) =>
    localStorage.setItem("RequestEmailToken", token),

  getRequestEmailToken: (): string | null =>
    localStorage.getItem("RequestEmailToken"),

  removeRequestEmailToken: () => localStorage.removeItem("RequestEmailToken"),

  // Email
  setEmail: (email: TStudentProfile["email"]) =>
    localStorage.setItem("email", email),

  getEmail: (): string | null => localStorage.getItem("email"),

  removeEmail: () => localStorage.removeItem("email"),

  // ID autoincrementable del estudiante
  setIdAutoIncrementStudent: (id: TStudent["id"]) =>
    localStorage.setItem("idAutoIncrementStudent", id.toString()),

  getIdAutoIncrementStudent: (): TStudent["id"] | null => {
    const value = localStorage.getItem("idAutoIncrementStudent");
    return value !== null ? Number(value) : null;
  },

  removeIdAutoIncrementStudent: () =>
    localStorage.removeItem("idAutoIncrementStudent"),

  setNotificationsStudent: (notifications: TNotificationsStudent) => {
    localStorage.setItem("notificationsStudent", JSON.stringify(notifications));
  },

  getNotificationsStudent: (): TNotificationsStudent => {
    try {
      const raw = localStorage.getItem("notificationsStudent");
      return raw ? (JSON.parse(raw) as TNotificationsStudent ) : [];
    } catch (e) {
      console.error("El JSON está mal formado:", e);
      return [];
    }
  },

  removeNotificationsStudent: () => localStorage.removeItem("notificationsStudent"),

  setNotificationsTeacher: (notifications: TNotificationsTeacher) => {
    localStorage.setItem("notificationsTeacher", JSON.stringify(notifications));
  },

  getNotificationsTeacher: (): TNotificationsTeacher => {
    try {
      const raw = localStorage.getItem("notificationsTeacher");
      return raw ? (JSON.parse(raw) as TNotificationsTeacher) : [];
    } catch (e) {
      console.error("El JSON está mal formado:", e);
      return [];
    }
  },

  removeNotificationsTeacher: () => localStorage.removeItem("notificationsTeacher"),


  setCoursesStudent: (courses: TCoursesStudents) => {
    localStorage.setItem("coursesStudent", JSON.stringify(courses));
  },
  getCoursesStudent: (): TCoursesStudents => {
    try {
      const raw = localStorage.getItem("coursesStudent");
      return raw ? (JSON.parse(raw) as TCoursesStudents) : [];
    } catch (e) {
      console.error("El JSON está mal formado:", e);
      return [];
    }
  },
  removeCoursesStudent: () => localStorage.removeItem("coursesStudent"),

  setCoursesTeacher: (courses: TCoursesTeachers) => {
    localStorage.setItem("coursesTeacher", JSON.stringify(courses));
  },
  getCoursesTeacher: (): TCoursesTeachers => {
    try {
      const raw = localStorage.getItem("coursesTeacher");
      return raw ? (JSON.parse(raw) as TCoursesTeachers) : [];
    } catch (e) {
      console.error("El JSON está mal formado:", e);
      return [];
    }
  },
  removeCoursesTeacher: () => localStorage.removeItem("coursesTeacher"),

  setCourseTeacher: (course: TCourseTeacherResponse) => {
    localStorage.setItem("courseTeacher", JSON.stringify(course));
  },
  getCourseTeacher: (): TCourseTeacherResponse | null => {
    try {
      const raw = localStorage.getItem("courseTeacher");
      return raw ? (JSON.parse(raw) as TCourseTeacherResponse) : null;
    } catch (e) {
      console.error("El JSON está mal formado:", e);
      return null;
    }
  },

  removeCourseTeacher: () => localStorage.removeItem("courseTeacher"),

  setLessonsStudents: (lessons: TLessonsStudent) => {
    localStorage.setItem("lessonsStudent", JSON.stringify(lessons));
  },
  getLessonsStudents: (): TLessonsStudent => {
    try {
      const raw = localStorage.getItem("lessonsStudent");
      return raw ? (JSON.parse(raw) as TLessonsStudent) : [];
    } catch (e) {
      console.error("El JSON está mal formado:", e);
      return [];
    }
  },
  removeLessonsStudents: () => localStorage.removeItem("lessonsStudent"),

  setLessonsTeacher: (lesson: TLessonsTeacher) =>
    localStorage.setItem("lessonsTeacher", JSON.stringify(lesson)),

  // Recupera el objeto de contenido desde localStorage
  getLessonsTeacher: (): TLessonsTeacher | null => {
    try {
      const raw = localStorage.getItem("lessonsTeacher");
      return raw ? (JSON.parse(raw) as TLessonsTeacher) : null;
    } catch (e) {
      console.error("El JSON está mal formado :", e);
      return null;
    }
  },
  // Elimina el content del localStorage
  removeLessonsTeacher: () => localStorage.removeItem("lessonsTeacher"),

  setFormLessonInfo: (formInfoLesson: TFormDataLesson) =>
    localStorage.setItem("formLesson", JSON.stringify(formInfoLesson)),

  getFormLessonInfo: (): TFormDataLesson | null => {
    try {
      const raw = localStorage.getItem("formLesson");
      return raw ? (JSON.parse(raw) as TFormDataLesson) : null;
    } catch (e) {
      console.error("El JSON está mal formado:", e);
      return null;
    }
  },

  removeFormLessonInfo: () => localStorage.removeItem("formLesson"),

  setLesson: (lesson: TLessonStudent | TLessonTeacherResponse | null) =>
    localStorage.setItem("lesson", JSON.stringify(lesson)),
  // Recupera el objeto de contenido desde localStorage
  getLesson: (): TLessonStudent | TLessonTeacherResponse | null => {
    try {
      const raw = localStorage.getItem("lesson");
      return raw
        ? (JSON.parse(raw) as TLessonStudent | TLessonTeacherResponse | null)
        : null;
    } catch (e) {
      console.error("El JSON está mal formado :", e);
      return null;
    }
  },

  // Elimina el content del localStorage
  removeLesson: () => localStorage.removeItem("lesson"),

  setContent: (content: TContent) =>
    localStorage.setItem("content", JSON.stringify(content)),

  // Recupera el objeto de contenido desde localStorage
  getContent: (): TContent | null => {
    try {
      const raw = localStorage.getItem("content");
      return raw ? (JSON.parse(raw) as TContent) : null;
    } catch (e) {
      console.error("El JSON está mal formado :", e);
      return null;
    }
  },

  // Elimina el content del localStorage
  removeContent: () => localStorage.removeItem("content"),

  setEvaluation: (evaluation: TEvaluation) =>
    localStorage.setItem("evaluation", JSON.stringify(evaluation)),

  // Recupera el objeto de contenido desde localStorage
  getEvaluation: (): TEvaluation | null => {
    try {
      const raw = localStorage.getItem("evaluation");
      return raw ? (JSON.parse(raw) as TEvaluation) : null;
    } catch (e) {
      console.error("El JSON está mal formado :", e);
      return null;
    }
  },

  // Elimina la evaluation del localStorage
  removeEvaluation: () => localStorage.removeItem("evaluation"),

  setInfoStudentsRegister: (infoStudents: TStudentsRegisters) =>
    localStorage.setItem("infoStudentsRegister", JSON.stringify(infoStudents)),

  getInfoStudentsRegister: (): TStudentsRegisters | [] => {
    try {
      const raw = localStorage.getItem("infoStudentsRegister");
      return raw ? (JSON.parse(raw) as TStudentsRegisters) : [];
    } catch (e) {
      console.error("El JSON está mal formado :", e);
      return [];
    }
  },
    // Elimina el content del localStorage
  removeInfoStudentsRegister: () => localStorage.removeItem("infoStudentsRegister"),



  setPaletteColors: (palette: TColorPalette) =>
    localStorage.setItem("paletteColors", JSON.stringify(palette)),
  // Recupera el objeto de de la paleta de colores desde localStorage
  getPaletteColors: (): TColorPalette | null => {
    try {
      const raw = localStorage.getItem("paletteColors");
      return raw ? (JSON.parse(raw) as TColorPalette) : null;
    } catch (e) {
      console.error("El JSON está mal formado :", e);
      return null;
    }
  },

  // Elimina la paleta de colores  del localStorage
  removePaletteColors: () => localStorage.removeItem("paletteColors"),

  // ============================================================================
  // FUNCIONES DE LIMPIEZA MASIVA PARA EVITAR RENDERIZACIÓN DE DATOS ANTIGUOS
  // ============================================================================

  /**
   * Limpia todos los datos relacionados con cursos del teacher
   * Útil al cambiar de curso o después de operaciones CRUD para evitar mostrar datos obsoletos
   */
  clearTeacherCourseData: () => {
    authStorage.removeCoursesTeacher();
    authStorage.removeCourseTeacher();
    authStorage.removeLessonsTeacher();
    authStorage.removeFormLessonInfo();
    authStorage.removeLesson();
    authStorage.removeContent();
    authStorage.removeEvaluation();
    authStorage.removeNotificationsTeacher();
    authStorage.removeComments();
    authStorage.removeAllStudents();
    authStorage.removeInfoStudentsRegister();
    authStorage.removePaletteColors();
  },

  /**
   * Limpia todos los datos relacionados con cursos del student
   * Útil al cambiar de curso o después de operaciones CRUD para evitar mostrar datos obsoletos
   */
  clearStudentCourseData: () => {
    localStorage.removeItem("coursesStudent"); // Lista de cursos del estudiante
    localStorage.removeItem("lessonsStudent"); // Lecciones del estudiante
    localStorage.removeItem("lesson"); // Lección individual
    localStorage.removeItem("content"); // Contenido de lección
    localStorage.removeItem("evaluation"); // Evaluación de lección
    localStorage.removeItem("comments"); // Comentarios del curso
  },

  /**
   * Limpia todos los datos de cursos (teacher y student)
   * Útil al hacer logout o cambiar de usuario
   */
  clearAllCoursesData: () => {
    localStorage.removeItem("coursesTeacher"); // Lista de cursos del teacher
    localStorage.removeItem("coursesStudent"); // Lista de cursos del student
    localStorage.removeItem("courseTeacher"); // Curso individual del teacher
    localStorage.removeItem("lessonsTeacher"); // Lecciones del teacher
    localStorage.removeItem("lessonsStudent"); // Lecciones del student
    localStorage.removeItem("lesson"); // Lección individual
    localStorage.removeItem("content"); // Contenido de lección
    localStorage.removeItem("evaluation"); // Evaluación de lección
    localStorage.removeItem("formLesson"); // Datos del formulario de lección
    localStorage.removeItem("comments"); // Comentarios
    localStorage.removeItem("notificationsTeacher");
  },

  /**
   * Limpia datos específicos de una lección individual
   * Útil al navegar entre lecciones o después de modificar una lección
   */
  clearLessonData: () => {
    localStorage.removeItem("lesson"); // Lección individual
    localStorage.removeItem("content"); // Contenido de lección
    localStorage.removeItem("evaluation"); // Evaluación de lección
  },

  /**
   * Limpia todos los datos de comentarios
   * Útil al cambiar de curso o después de operaciones en comentarios
   */
  clearCommentsData: () => {
    localStorage.removeItem("comments"); // Comentarios del curso
    localStorage.removeItem("allStudents"); // Lista de estudiantes que comentaron
  },

  /**
   * Función de limpieza completa (excepto autenticación)
   * Útil para resetear toda la aplicación manteniendo al usuario logueado
   */
  clearAllDataExceptAuth: () => {
    // Mantener datos de autenticación
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    const consent = localStorage.getItem("cookieConsentGiven");

    // Limpiar todo el localStorage
    localStorage.clear();

    // Restaurar datos de autenticación
    if (token) localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", user);
    if (role) localStorage.setItem("role", role);
    if (email) localStorage.setItem("email", email);
    if (consent) localStorage.setItem("cookieConsentGiven", consent);
  },
};
