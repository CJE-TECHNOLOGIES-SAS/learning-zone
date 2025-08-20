// types/Teacher.ts
import type { TCourse, TEvaluation, TContent } from "../../courses/types/CourseStudent";
import type { TTeacher } from "../../types/User";

/* CURSO - Response del backend */
export type TCourseTeacherResponse = Pick<TCourse, 'id' | 'name' | 'description' | 'image' | 'category' | 'name_palette' | 'palette'> & {
  is_published: boolean;
  teacher_id:TTeacher['id']
};

/* CURSO - Envío al backend */
export type TCourseTeacherSend = Pick<TCourse, 'name' | 'description' | 'category' | 'name_palette' | 'image' | 'palette'>;

/* Leccion del teacher que recibe del backend */
/* LECCIÓN - Response */
export type TLessonTeacherResponse = {
  id: number;
  name: string;
};
export type TLessonsTeacherResponse = TLessonTeacherResponse[];

/* Info de leccion que retorna el backend
    lesson: {
      name: "",
      content: {
        contentType: "text",
        file: null,
        text: "",
      },
    },
*/
export type TLessonContentResponse ={
  name:TLessonTeacherResponse['name'],
  content:{
    content_type:TContent['contentType']
    file: File | null
    text:TContent['text']
  }
}


/* LECCIÓN - Envío */
export type TLessonTeacherSend = {
  idCourse:TCourse['id'],
  name: string;
  content: {
    content_type: TContent['contentType'];
    text: string;
    file: File | null;
  };
};

/* EVALUACIÓN - Response */
export type TEvaluationTeacherResponse = {
  id: TEvaluation['id'];
  questionType: TEvaluation['questionType'];
  question: TEvaluation['question'];
  options: TEvaluation['options'];
};

/* EVALUACIÓN - Envío */
export type TEvaluationTeacherSend = {
  question_type: TEvaluation['questionType'];
  question: TEvaluation['question'];
  options?: TEvaluation['options'];
  correct_answer?: string;
};

/* Cursos múltiples */
export type TCoursesTeachers = TCourseTeacherResponse[];

/* Formulario completo */
export type TFormDataLesson = {
  lesson: TLessonTeacherSend;
  evaluation: TEvaluationTeacherSend;
};




/* Tipado del contexto */


export interface TTeacherCourseContextType {
  coursesTeacher: TCourseTeacherResponse[]; // Cursos del profesor
  setCoursesTeacher: React.Dispatch<React.SetStateAction<TCourseTeacherResponse[]>>;
  courseTeacher: TCourseTeacherResponse | null;
  loadInfoCourse: (idCourse: TCourseTeacherResponse["id"]) => Promise<void>;
  lessons: TLessonsTeacher; // Lecciones del curso actual
  setLessons?: React.Dispatch<React.SetStateAction<TLessonsTeacher>>; // No se exporta desde el context, pero lo dejo opcional por si lo expones
  formLesson: TFormDataLesson | null; // Estructura con todos los datos de la lección
  loadLessonsCourse: (idCourse: TCourseTeacherResponse["id"]) => Promise<void>;
  loadLesson: (
    idCourse: TCourseTeacherResponse["id"],
    idLesson: number
  ) => Promise<void>;
  palette: TColorPalette | null;
  setPalette: React.Dispatch<React.SetStateAction<TColorPalette | null>>;
  refreshCoursesTeacher: () => Promise<void>;
  notificationsTeacher: TNotificationsTeacher;
  setNotificationsTeacher: React.Dispatch<React.SetStateAction<TNotificationsTeacher>>;
}
