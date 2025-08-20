import React, { useEffect, useState } from "react";

// Contexto principal

// Utilidades
import { authStorage } from "../../../shared/Utils/authStorage"; // Módulo que gestiona localStorage (guardar y obtener token/user)

// Servicios
import ContentLessonsAPI from "../services/ContentLessons.server";
import EvaluationLessonsAPI from "../services/EvaluationLesson.server";
import LessonsCourseAPI from "../services/LessonsCourse.server";

// Tipos
import {
  type TContent,
  type TCourse,
  type TCoursesStudents,
  type TEvaluation,
  type TLessonsStudent,
  type TLessonStudent,
  type TProgressCourses,
} from "../types/CourseStudent";
import toast from "react-hot-toast";
import GetCoursesAPI from "../services/GetCourses";
import ProgressCoursesAPI from "../../student/services/GetProgressCourses.server";
import type { TColorPalette } from "../../../shared/theme/ColorPalettesCourses";
import { StudentCourseContext } from "./StudentCourseContext";
import type { TLessonTeacherResponse } from "../../teacher/types/Teacher";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth/Hooks/useAuth";

// Props que recibe el Provider: los hijos que van dentro del contexto
type Props = {
  children: React.ReactNode;
};

// Provider principal que controla todo lo relacionado con la sesión del estudiante
export const StudentCourseProvider = ({ children }: Props) => {

  const { role } = useUser()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<TCoursesStudents>([]);
  const [lessons, setLessons] = useState<TLessonsStudent>([]);
  const [progressLessons, setProgressLessons] = useState<TProgressCourses>([]);
  const [progress,setProgress] = useState(0); /* Progreso del curso especifico */
  const [currentLesson, setCurrentLesson] = useState<TLessonStudent | TLessonTeacherResponse | null>(null); /* Leccion que se esta haciendo */
  const [content, setContent] = useState<TContent | null>(null); /* Contenido de la leccion */
  const [evaluation, setEvaluation] = useState<TEvaluation | null>(null); /* Evaluacion de la leccion */
  const [palette, setPalette] = useState<TColorPalette | null>(null);
  // Carga inicial: verifica si hay cursos guardados en localStorage
  useEffect(() => {
    const storedCourses = authStorage.getCoursesStudent(); // Trae cursos guardado si existe
    const storedContentLesson = authStorage.getContent(); // Trae contenido guardado si existe
    const storedLessons = authStorage.getLessonsStudents() /* Trae las lecciones guardadas si existen */
    const storedLesson = authStorage.getLesson() /* Trae la leccion que se esta haciendo si existe */
    const storedEvaluationLesson = authStorage.getEvaluation(); // Trae evaluacion guardado si existe */
    const storedPaletteColors = authStorage.getPaletteColors(); // Trae evaluacion guardado si existe */
    const token = authStorage.getToken();
    if (token && storedCourses.length ===0) {
      if (role !== "student") return; // 👈 evitar que se ejecute si no es estudiante
      // Si no existen cursos, ejecutar el servicio que envía el token al backend y obtiene los cursos del estudiante
      const infoCourses = async () => {
        // Accediendo al backend y obteniendo los cursos
        const dataCourses = await GetCoursesAPI();
        // Almacenando los cursos del estudiante en el localStorage
        authStorage.setCoursesStudent(dataCourses);
        /* Setear los cursos en el estado */
        setCourses(dataCourses);
      };

      infoCourses();
    }

    // Si hay sesión guardada, se setean los valores
    if (storedPaletteColors) {
      setPalette(storedPaletteColors);
    }
    // Si hay sesión guardada, se setean los valores
    if (storedCourses) {
      setCourses(storedCourses);
    }

    // Si hay sesión guardada, se setean los valores
    if (storedLessons) {
      setLessons(storedLessons);
    }

    // Si hay content guardada, se setean los valores
    if (storedLesson) {
      setCurrentLesson(storedLesson);
    }
    if (storedContentLesson) {
      setContent(storedContentLesson);
    }
    if (storedEvaluationLesson) {
      setEvaluation(storedEvaluationLesson);
    }
  }, []);

  // ✅ LISTENER DE EVENTOS: Escuchar cambios en localStorage para cursos filtrados (ESTUDIANTES)
  useEffect(() => {
    // Función que se ejecuta cuando detecta cambios en localStorage
    const handleStorageChange = () => {
      // Leer los cursos actuales del localStorage (pueden estar filtrados por categoría)
      const storedCourses = authStorage.getCoursesStudent();
      if (storedCourses) {
        // Actualizar el contexto con los cursos del localStorage
        // Esto sincroniza el contexto con los filtros aplicados desde ViewCategories
        setCourses(storedCourses);
      }
    };

    // Escuchar eventos de storage nativo (cambios desde otras pestañas/componentes)
    // Este evento se dispara automáticamente cuando localStorage cambia
    window.addEventListener('storage', handleStorageChange);

    // También escuchar nuestro evento personalizado para cambios internos
    // Este evento lo disparamos manualmente desde ViewCategories para estudiantes
    window.addEventListener('coursesStudentUpdated', handleStorageChange);

    // Cleanup: Remover listeners al desmontar el componente
    // Esto previene memory leaks
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('coursesStudentUpdated', handleStorageChange);
    };
  }, []); // Se ejecuta solo una vez al montar el componente

  // ✅ POLLING DE RESPALDO: Sistema de verificación automática cada 500ms (ESTUDIANTES)
  useEffect(() => {
    // Función que verifica si localStorage y contexto están sincronizados
    const pollLocalStorage = () => {
      // Leer cursos del localStorage (pueden estar filtrados por categoría)
      const storedCourses = authStorage.getCoursesStudent();
      // Contar cursos actuales en el contexto
      const currentCoursesLength = courses.length;
      // Contar cursos en localStorage
      const storedCoursesLength = storedCourses ? storedCourses.length : 0;

      // ⚠️ DETECCIÓN DE DESINCRONIZACIÓN: Si hay diferencia entre localStorage y contexto
      // Esto puede pasar si los eventos no se dispararon correctamente
      if (storedCourses && (currentCoursesLength !== storedCoursesLength)) {
        // Sincronizar: Actualizar contexto con los datos de localStorage
        // Esto garantiza que el dashboard del estudiante SIEMPRE muestre los cursos correctos
        setCourses(storedCourses);
      }
    };

    // Ejecutar polling cada 500ms (medio segundo)
    // Este intervalo es suficientemente rápido para parecer instantáneo
    // pero no tan rápido como para afectar el rendimiento
    const interval = setInterval(pollLocalStorage, 500);

    // Cleanup: Limpiar interval al desmontar el componente
    // Esto previene que el polling continúe cuando el componente no existe
    return () => clearInterval(interval);
  }, [courses]); // Se ejecuta cuando cambian los cursos en el contexto

      /* Funcion que se encarga de mostrar el porcentaje completo */
    useEffect(() => {
      if (lessons.length === 0) return;

      let number = 0;
      lessons.forEach((lesson) => {
        if (lesson.progressState === 'complete') {
          number += 1;
        }
      });

      const porcent = Math.round((number / lessons.length) * 100);
      setProgress(porcent);
    }, [lessons]);

    const refreshCoursesStudent = async () => {
      const token = authStorage.getToken();
      if (token) {
        // Limpiar cache de cursos antes de solicitar nuevos datos
        authStorage.removeCoursesStudent();

        const dataCourses = await GetCoursesAPI();
        authStorage.setCoursesStudent(dataCourses);
        setCourses(dataCourses);
      }
    };


  const storageLessons = authStorage.getLessonsStudents()
  useEffect(()=>{
    if(storageLessons.length >0){
      setLessons(storageLessons)
    }
  },[])
  /* Funcion que se encarga de solicitar las lecciones de un curso */
  const loadLessonsCourse  = async(idCourse:TCourse['id'])=>{
    try{
        const lessonsRes = await LessonsCourseAPI(idCourse);
        console.log(lessonsRes)

        const lessonsStorage: TLessonsStudent = lessonsRes.map((l) => ({
            id: l.id,
            name:l.name,
            progressState:l.progress_state,
            idCourse:idCourse,
            nameCourse:l.name
          }));
        console.log(lessonsStorage)

        authStorage.setLessonsStudents(lessonsStorage)
        setLessons(lessonsStorage) /* Setear las lecciones para poder renderizarlas en el home del curso */
        /* Setear los valores al localstorage */


    }catch(error){
        console.log(error)
        toast.error('Ups ocurrio un error')
    }
  }
  /* Funcion que carga el contenido de la leccion */
  const loadLessonContent = async (idCourse: TCourse["id"], lesson: TLessonStudent) => {
    try{
      const contentRes = await ContentLessonsAPI({idCourse,idLesson: lesson.id})
      /* juntar el nombre de la leccion, con el contenido obtenido del backend */
      const contentStorage:TContent = {
        id:contentRes.id,
        contentType:contentRes.content_type,
        content:contentRes.content,
        text:contentRes.text,
        title:lesson.name
      }
        /* Setear en el estado que almacena la leccion que se esta haciendo en el momento */
        /* Setear en el localStorage la leccion que se esta haciendo actualmente */
        setCurrentLesson(lesson)
        authStorage.setLesson(lesson)
        /* Setearlo en el localStorage */
        setContent(contentStorage) /* Setear el contenido en su estado, listo para ser renderizado */
        authStorage.setContent(contentStorage)
    }catch(error){
        console.log(error)
        toast.error('Ups no se pudo cargar')
    }
  };

  /* Funcion que carga la evaluacion de la leccion */
  const loadLessonEvaluation = async (idCourse: TCourse["id"], idLesson: TLessonStudent['id']) => {
    try{
        const evaluationRes = await EvaluationLessonsAPI({idCourse,idLesson})
        console.log(evaluationRes)
        const evaluationStorage:TEvaluation = {
          id:evaluationRes.id_evaluation,
          questionType:evaluationRes.question_type,
          question:evaluationRes.question,
          options:evaluationRes.options
        }
        setEvaluation(evaluationStorage) /* Setear la evaluacion  en su estado, listo para ser renderizado */
        authStorage.setEvaluation(evaluationStorage)
    }catch(error){
        console.log(error)
        toast.error('Ups no se pudo cargar')
    }
      };
    /* Funcion que carga el progreso */
    const loadProgressLessons = async () => {
        try{
            const progressLessonsRes = await ProgressCoursesAPI()
            setProgressLessons(progressLessonsRes) /* Setear los progreso en su estado, listo para ser renderizado */
        }catch(error){
            console.log(error)
            toast.error('Ups no se pudo cargar')
        }
          };


  const renderContent =async(idCourse:TCourse['id'], lesson:TLessonStudent)=>{
    await loadLessonContent(idCourse,lesson);
    /* Rederigir a la page del contenido */
    navigate('/student/content-page')

  }

  const renderEvaluation =async(idCourse:TCourse['id'], idLesson:TLessonStudent['id'])=>{
    alert(idCourse)

    await loadLessonEvaluation(idCourse,idLesson);
    /* Rederigir a la page del contenido */
    navigate('/student/evaluation-page')

  }

  return (
    // El Provider envuelve toda la app y expone el contexto con los valores globales
    <StudentCourseContext.Provider
      value={{
        setCourses,
        courses,
        // Lecciones del curso actual cargado
        lessons,
        // Permite modificar las lecciones desde otros componentes (por ejemplo, marcar como completada)
        setLessons,
        // Porcentaje de progreso del curso
        progress,
        // Lección actual que el estudiante está viendo (estado compartido)
        content,
        // Evaluación actual de la lección (preguntas)
        evaluation,
        // Función que carga las lecciones de un curso según su id
        loadLessonsCourse,
        // Función que carga el contenido de una lección específica
        loadLessonContent,
        // Función que carga la evaluación de una lección específica
        loadLessonEvaluation,
        progressLessons,
        loadProgressLessons,
        /* Funcion que se encarga de llamar otra funcion que carga los datos del contenido y los setea, ademas redirije a la page del contenido */
        renderContent,
        /* Funcion que se encarga de llamar otra funcion que carga los datos de la evaluacion y los setea, ademas redirije a la page de la evaluacion */
        renderEvaluation,
        /* Leccion que se esta haciendo */
        currentLesson,
        setPalette,
        palette,
        refreshCoursesStudent
      }}
    >
      {/* Solo renderiza la app si ya se hizo la validación inicial de sesión */}
      {children}
    </StudentCourseContext.Provider>
  );
};
