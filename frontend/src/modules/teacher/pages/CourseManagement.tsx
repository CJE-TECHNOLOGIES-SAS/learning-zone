import CardLessonCourse from "../components/CardLessonCourse";
import type { TLessonTeacherResponse } from "../types/Teacher";
import { useNavigate, useParams } from "react-router-dom";
import { useTeacherCourseContext } from "../hooks/useCourseTeacher";
import { authStorage } from "../../../shared/Utils/authStorage";
import { useEffect, useState } from "react";
import UpdateIsPublishedAPI from "../services/Course/UpdateIsPublished.server";
import DeleteCourseAPI from "../services/Course/DeleteCourse.serve";
import toast from "react-hot-toast";
/* icons */
import { IoAddOutline, IoArrowBackCircleSharp } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import GetCourseTeacherAPI from "../services/Course/GetCourseTeacher.server";
import "../styles/CourseManagement.css";
import BtnArrowInfinite from "../../../shared/animations/ButtonArrowInfinitive";
import { COURSE_CATEGORY_LABELS } from "../../../shared/constant/CategoriesCourses";
import { windowModalDelete } from "../../../shared/animations/WindowModalDelete";

export default function CourseManagement() {
  const {
    lessons,
    loadInfoCourse,
    courseTeacher,
    refreshCoursesTeacher,
    loadLessonsCourse,
  } = useTeacherCourseContext();

  // Estado local para manejar el estado de publicación
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [isUpdatingPublished, setIsUpdatingPublished] =
    useState<boolean>(false);

          // console.log(lessons);

  const { courseId } = useParams<{ courseId: string }>();
  const idCourse = Number(courseId);
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar todos los datos del curso anterior al cambiar de curso
    authStorage.clearTeacherCourseData();

    if (idCourse) {
      loadInfoCourse(idCourse);
      loadLessonsCourse(idCourse);
    }
  }, [idCourse]);

  // Sincronizar el estado local con el curso cargado
  useEffect(() => {
    window.scrollTo(0, 0); // 📌 Lleva el scroll al inicio
    if (courseTeacher) {
      setIsPublished(courseTeacher.is_published);
    }
  }, [courseTeacher]);

  const handleClickAggLesson = () => {
    authStorage.removeFormLessonInfo();
    navigate(`/teacher/courses/${idCourse}/lessons/create`);
  };

  const handleClickPublished = async () => {
    setIsUpdatingPublished(true);

    try {
      // Cambiar el estado inmediatamente en la UI
      const newPublishedState = !isPublished;
      setIsPublished(newPublishedState);

      // Ejecutar la lógica de actualización en el backend
      const response = await UpdateIsPublishedAPI(idCourse, newPublishedState);

      if (response === 200) {
        // Actualizar el curso en el contexto y localStorage
        await loadInfoCourse(idCourse);

        toast.success(
          newPublishedState
            ? "Curso publicado exitosamente"
            : "Curso despublicado exitosamente"
        );
      } else {
        // Si falla, revertir el estado
        setIsPublished(!newPublishedState);
        toast.error("Error al actualizar el estado de publicación");
      }
    } catch (error) {
      // Si hay error, revertir el estado
      setIsPublished(!isPublished);
      console.error("Error al actualizar publicación:", error);
      toast.error("Error al actualizar el estado de publicación");
    } finally {
      setIsUpdatingPublished(false);
    }
  };

  const handleClickEditCourse = async () => {
    const response = await GetCourseTeacherAPI(idCourse);
    authStorage.setCourseTeacher(response);
    navigate(`/teacher/courses/${idCourse}/edit`);
  };

  const handleClickDeleteCourse = async () => {
    const result = await windowModalDelete({title:'¿Eliminar Curso?', text:'Esta acción no se puede deshacer'})
    if (!result) {
      return;
    }
    const response = await DeleteCourseAPI(idCourse);
    toast.success(response.message || "Curso eliminado correctamente");

    // Limpiar todos los datos relacionados después de eliminar
    authStorage.clearAllCoursesData();

    await refreshCoursesTeacher();
    navigate(`/teacher/courses`);
  };


  const palette = courseTeacher?.palette || {
    brand: "#000",
    surface: "#fff",
    text: "#000",
    accent: "#ccc",
  };
  const catInfo = courseTeacher?.category
  ? COURSE_CATEGORY_LABELS[courseTeacher.category as keyof typeof COURSE_CATEGORY_LABELS]
  : undefined;
  if (!courseTeacher) {
  return <div className="skeleton-course">Cargando curso…</div>;
}


  return (

    <div
      className="container-management-course-teacher"
      style={{
        backgroundColor: palette.surface,
        color: palette.text,
        border: `2px solid ${palette.accent}`,
        padding: "1rem",
        borderRadius: "10px",
      }}
    >
      {/* Botón de regreso */}
      <button
        className="btn-back-teacher-course"
        style={{
          color: 'black',
        }}
        onClick={() => navigate('/teacher/home-teacher')}
      >
        <IoArrowBackCircleSharp />
      </button>

      <header className="header-crud-course-teacher">
        <img
          className="image-course-header-teacher"
          src={courseTeacher?.image}
          alt={`Imagen del curso ${courseTeacher?.name}`}
        />
        <div className="container-info-course">
        <span
          className="category-management-course"
          style={{ background: catInfo?.color ?? palette.accent }}
        >
          {catInfo?.label ?? courseTeacher?.category ?? '—'}
        </span>


          <h2 className="title-course" style={{ color: palette.brand }}>
            {courseTeacher?.name}
          </h2>
          <p className="description-course">{courseTeacher?.description}</p>
        </div>

        <div className="crud-actions">
          <button
            type="button"
            title="Eliminar curso"
            onClick={handleClickDeleteCourse}
            style={{ borderColor: palette.accent, color: "red" }}
          >
            <MdOutlineDelete /> Eliminar
          </button>

          <button
            type="button"
            title="Actualizar curso"
            onClick={handleClickEditCourse}
            style={{ borderColor: palette.accent, color: palette.text }}
          >
            <FiEdit3 /> Editar
          </button>

          {lessons.length >= 5 ? (
            <button
              type="button"
              title="Publicar o despublicar"
              onClick={handleClickPublished}
              disabled={isUpdatingPublished}
              style={{
                backgroundColor: isPublished ? "#F87171" : "#34D399", // rojo o verde según el estado
                color: "#fff",
                fontWeight: "bold",
                border: `1px solid ${isPublished ? "#DC2626" : "#059669"}`,
                borderRadius: "6px",
                padding: "0.5rem 1rem",
                opacity: isUpdatingPublished ? 0.7 : 1,
                cursor: isUpdatingPublished ? "not-allowed" : "pointer",
              }}
            >
              {isUpdatingPublished
                ? "⏳ Actualizando..."
                : isPublished
                  ? "Quitar"
                  : "Publicar"}
            </button>
          ):
            <button
            className="btn-disabled"
              type="button"
              disabled
              style={{
                backgroundColor:"#D1CECB",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "6px",
                padding: "0.5rem 1rem",
                opacity: isUpdatingPublished ? 0.7 : 1,
              }}>
                Publicar



              </button>



          }
        </div>

        <div
          className="btn-arrow-infinite-container"
          style={{
            position: "absolute",
            top: lessons.length === 0 ? "60%" : "40%",
            left: "50%",
          }}
        >
          <BtnArrowInfinite color={palette.accent} />
        </div>
      </header>

      <button
        className="btn-add-lesson-course"
        onClick={handleClickAggLesson}
        style={{
          backgroundColor: palette.brand,
          color: "#fff",
          padding: "0.5rem 1rem",
          border: `1px solid ${palette.accent}`,
          borderRadius: "5px",
          marginTop: "1rem",
        }}
      >
        <IoAddOutline /> Agregar lección
      </button>

      <div className="container-lesson-cards-teacher">
        {lessons.length === 0 && (
          <p className="text-no-lessons">
            No hay lecciones aún. ¡Agrega la primera lección!
          </p>
        )}
        {lessons.map((lesson: TLessonTeacherResponse) => (
          <CardLessonCourse
            key={lesson.id}
            idCourse={idCourse}
            idLesson={lesson.id}
            name={lesson.name}
          />
        ))}
      </div>
    </div>
  );
}
