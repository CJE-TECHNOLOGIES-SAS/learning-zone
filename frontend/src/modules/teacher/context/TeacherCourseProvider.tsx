import React, { useEffect, useState } from "react";

// Contexto principal

// Utilidades
import { authStorage } from "../../../shared/Utils/authStorage"; // Módulo que gestiona localStorage (guardar y obtener token/user)

// Servicios

// Tipos

import toast from "react-hot-toast";
import type { TColorPalette } from "../../../shared/theme/ColorPalettesCourses";
import type { TLessonsTeacher } from "../../courses/types/CourseStudent";
import GetCoursesTeacherAPI from "../services/Course/GetCoursesTeacher.server";
import type { TCoursesTeachers, TCourseTeacherResponse, TFormDataLesson, TLessonTeacherResponse, TLessonTeacherSend } from "../types/Teacher";
import GetLessonTeacherAPI from "../services/Lesson/GetLessonsCourseTeacher.server";
import { TeacherCourseContext } from "./TeacherCourseContext";
import GetCourseTeacherAPI from "../services/Course/GetCourseTeacher.server";
import LoadInfoLessonTeacherAPI from "../services/Lesson/LoadInfoLessonTeacher.server";
import LoadEvaluationLessonAPI from "../services/Evaluation/LoadEvaluationLesson.server";
import type { TNotificationsTeacher } from "../../notifications/types/Notifications";

// Props que recibe el Provider: los hijos que van dentro del contexto
type Props = {
  children: React.ReactNode;
};

// Provider principal que controla todo lo relacionado con la sesión del estudiante
export const TeacherCourseProvider = ({ children }: Props) => {
 // Estado alineado con el contexto
const [coursesTeacher, setCoursesTeacher] = useState<TCoursesTeachers>([]);
const [courseTeacher, setCourseTeacher] = useState<TCourseTeacherResponse | null>(null);
const [lessons, setLessons] = useState<TLessonsTeacher>([]);
const [formLesson, setFormLesson] = useState<TFormDataLesson | null>(null);
const [palette, setPalette] = useState<TColorPalette | null>(null);
const [notificationsTeacher, setNotificationsTeacher] = useState<TNotificationsTeacher>([]);

// Carga inicial
useEffect(() => {
  const storedCourses = authStorage.getCoursesTeacher();
  const storedCourse = authStorage.getCourseTeacher();
  const storedLessons = authStorage.getLessonsTeacher();
  const storedPaletteColors = authStorage.getPaletteColors();
  const token = authStorage.getToken();

  if (token && (!storedCourses || storedCourses.length === 0)) {
    (async () => {
      const dataCourses = await GetCoursesTeacherAPI();
      authStorage.setCoursesTeacher(dataCourses);
      setCoursesTeacher(dataCourses);
    })();
  } else if (storedCourses) {
    setCoursesTeacher(storedCourses);
  }

  if (storedPaletteColors) setPalette(storedPaletteColors);
  if (storedCourse) setCourseTeacher(storedCourse);
  if (storedLessons) setLessons(storedLessons);
}, []);

// ✅ LISTENER DE EVENTOS: Escuchar cambios en localStorage para cursos filtrados
useEffect(() => {
  // Función que se ejecuta cuando detecta cambios en localStorage
  const handleStorageChange = () => {
    // Leer los cursos actuales del localStorage (pueden estar filtrados)
    const storedCourses = authStorage.getCoursesTeacher();
    if (storedCourses) {
      // Actualizar el contexto con los cursos del localStorage
      // Esto sincroniza el contexto con los filtros aplicados
      setCoursesTeacher(storedCourses);
    }
  };

  // Escuchar eventos de storage nativo (cambios desde otras pestañas/componentes)
  // Este evento se dispara automáticamente cuando localStorage cambia
  window.addEventListener('storage', handleStorageChange);

  // También escuchar nuestro evento personalizado para cambios internos
  // Este evento lo disparamos manualmente desde ViewCategories
  window.addEventListener('coursesTeacherUpdated', handleStorageChange);

  // Cleanup: Remover listeners al desmontar el componente
  // Esto previene memory leaks
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('coursesTeacherUpdated', handleStorageChange);
  };
}, []); // Se ejecuta solo una vez al montar el componente

// ✅ POLLING DE RESPALDO: Sistema de verificación automática cada 500ms
useEffect(() => {
  // Función que verifica si localStorage y contexto están sincronizados
  const pollLocalStorage = () => {
    // Leer cursos del localStorage (pueden estar filtrados por categoría)
    const storedCourses = authStorage.getCoursesTeacher();
    // Contar cursos actuales en el contexto
    const currentCoursesLength = coursesTeacher.length;
    // Contar cursos en localStorage
    const storedCoursesLength = storedCourses ? storedCourses.length : 0;

    // ⚠️ DETECCIÓN DE DESINCRONIZACIÓN: Si hay diferencia entre localStorage y contexto
    // Esto puede pasar si los eventos no se dispararon correctamente
    if (storedCourses && (currentCoursesLength !== storedCoursesLength)) {
      // Sincronizar: Actualizar contexto con los datos de localStorage
      // Esto garantiza que el dashboard SIEMPRE muestre los cursos correctos
      setCoursesTeacher(storedCourses);
    }
  };

  // Ejecutar polling cada 500ms (medio segundo)
  // Este intervalo es suficientemente rápido para parecer instantáneo
  // pero no tan rápido como para afectar el rendimiento
  const interval = setInterval(pollLocalStorage, 500);

  // Cleanup: Limpiar interval al desmontar el componente
  // Esto previene que el polling continúe cuando el componente no existe
  return () => clearInterval(interval);
}, [coursesTeacher]); // Se ejecuta cuando cambian los cursos en el contexto

// Evita el segundo useEffect con alert y duplis; si lo necesitas, deja solo este patrón:
useEffect(() => {
  const storageLessons = authStorage.getLessonsTeacher();
  if (storageLessons?.length) setLessons(storageLessons);
}, []);

// Refresh de cursos
const refreshCoursesTeacher = async () => {
  const token = authStorage.getToken();
  if (!token) return;
  authStorage.removeCoursesTeacher();
  const dataCourses = await GetCoursesTeacherAPI();
  authStorage.setCoursesTeacher(dataCourses);
  setCoursesTeacher(dataCourses);
};

// Cargar info curso
const loadInfoCourse = async (idCourse: TCourseTeacherResponse["id"]) => {
  try {
    authStorage.removeCourseTeacher();
    const courseRes = await GetCourseTeacherAPI(idCourse);
    setCourseTeacher(courseRes);
    authStorage.setCourseTeacher(courseRes);
  } catch (e) {
    console.error(e);
    toast.error("Ups ocurrió un error");
  }
};

// Cargar lecciones
const loadLessonsCourse = async (idCourse: TCourseTeacherResponse["id"]) => {
  try {
    authStorage.clearLessonData();
    const lessonsRes = await GetLessonTeacherAPI(idCourse);
    setLessons(lessonsRes);
    authStorage.setLessonsTeacher(lessonsRes);
  } catch (e) {
    console.error(e);
    toast.error("Ups este curso no cuenta con lecciones, recuerda agregar algunas!");
  }
};

  /* Funcion que carga todo lo de la leccion */
  const loadLesson = async (idCourse: TCourseTeacherResponse["id"], idLesson: TLessonTeacherResponse['id']) => {
    try{
      /* Logica que trae el contenido de la leccion*/

      const contentLesson = await LoadInfoLessonTeacherAPI(idLesson)
      console.log(contentLesson)
      const contentStorage:Omit<TLessonTeacherSend, 'idCourse'>= {
        name:contentLesson.name,
        content:{
          content_type:contentLesson.content.content_type,
          file:contentLesson.content.file,
          text:contentLesson.content.text
       }
      }
      console.log('Contentt.',contentStorage)
      /* Logica que trae la evaluacion */
      const evaluationLesson = await LoadEvaluationLessonAPI(idCourse,idLesson)
     /*  const opcReal = JSON.parse(evaluationLesson.options || '[]'); */
      const evaluationStorage ={
            question_type: evaluationLesson.question_type ,
            question: evaluationLesson.question,
            options:evaluationLesson.options,
            correct_answer:evaluationLesson.correct_answer,
      }

      const formDataLesson: TFormDataLesson = {
        lesson: {
          idCourse,
          name: contentStorage.name,
          content: contentStorage.content
        },
        evaluation: evaluationStorage
      };
      /* Setearlo en el estado */
      setFormLesson(formDataLesson)
      /* Setearlo en el localStorage */
      authStorage.setFormLessonInfo(formDataLesson)
      console.log(formDataLesson)
      /* Redirigir al page de editar lesson */ /* ENVIAR POR PARAMETRO DE RUTA LOS IDES  */



    }catch(error){
        console.log(error)
        toast.error('Ups no se pudo cargar')
    }
  };

return (
  <TeacherCourseContext.Provider
    value={{
      loadLesson,
      coursesTeacher,
      setCoursesTeacher,
      courseTeacher,
      loadInfoCourse,
      lessons,
      formLesson,
      loadLessonsCourse,
      palette,
      setPalette,
      refreshCoursesTeacher,
      notificationsTeacher,
      setNotificationsTeacher,
    }}
  >
    {children}
  </TeacherCourseContext.Provider>
);

};
