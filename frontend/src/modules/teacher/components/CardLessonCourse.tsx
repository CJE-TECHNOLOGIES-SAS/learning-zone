import { useNavigate } from "react-router-dom";
import { useTeacherCourseContext } from "../hooks/useCourseTeacher";
import type { TCourseTeacherResponse, TLessonTeacherResponse } from "../types/Teacher";
import DeleteLessonAPI from "../services/Lesson/DeleteLesson.server";
import toast from "react-hot-toast";
/* icons */
import { FiEdit3 } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import { authStorage } from "../../../shared/Utils/authStorage";
import Swal from "sweetalert2";
import '../styles/CardLessonCourse.css';

type CardLessonCourseProps = {
  idLesson: TLessonTeacherResponse['id'];
  idCourse: TCourseTeacherResponse['id'];
  name: TLessonTeacherResponse['name'];
};

export default function CardLessonCourse({ idCourse, idLesson, name }: CardLessonCourseProps) {
  const { loadLesson, courseTeacher, loadLessonsCourse } = useTeacherCourseContext();
  const navigate = useNavigate();

  const palette = courseTeacher?.palette || {
    brand: '#000',
    surface: '#fff',
    text: '#000',
    accent: '#ccc',
  };

  const handleClickBtnEdit = async () => {
    await loadLesson(idCourse, idLesson);
    navigate(`/teacher/courses/${idCourse}/lessons/${idLesson}/edit`);
  };

  const handleClickDelete = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar lección?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,

      // Estilos personalizados
      customClass: {
        popup: "educational-confirm-popup",
        title: "educational-confirm-title",
        content: "educational-confirm-content",
        confirmButton: "educational-confirm-delete",
        cancelButton: "educational-confirm-cancel",
      },

      backdrop: `
        rgba(30, 58, 138, 0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `,

      showClass: {
        popup: "animate__animated animate__zoomIn animate__faster",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut animate__faster",
      },

      buttonsStyling: false,
      timer: 15000,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: true,
      stopKeydownPropagation: false,
    });

    // Si cancela o rechaza, cortamos el flujo
    if (!result.isConfirmed) {
      return;
    }

    try {
      await DeleteLessonAPI({ idCourse, idLesson });

      // Limpiar cache de lecciones después de eliminar
      authStorage.clearLessonData();

      // Recargar lecciones del curso
      await loadLessonsCourse(idCourse);
      toast.success("Lección eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar lección:", error);
      toast.error("Error al eliminar la lección");
    }
  };

  return (
    <div
      className="container-card-lesson"
      style={{
        backgroundColor: palette.surface,
        border: `2px solid ${palette.accent}`,
        color: palette.text,
      }}
    >
      <h2
        className="title-card-lesson"
        style={{ color: palette.brand }}
      >
        {name}
      </h2>

      <div className="container-opc-crud-lesson">
        <button
          className="btn-edit-lesson"
          onClick={handleClickBtnEdit}
        >
          <FiEdit3 />
        </button>

        <button
          className="btn-delete-lesson"
          onClick={handleClickDelete}
        >
          <MdOutlineDelete />
        </button>
      </div>
    </div>
  );
}
