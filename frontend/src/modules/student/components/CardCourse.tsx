import { RiProgress8Line } from "react-icons/ri";
import { GrStatusGood } from "react-icons/gr";
import '../Styles/CardCourse.css';
import type { TCourse, TCourseStudent } from '../../courses/types/CourseStudent';
import { useNavigate } from 'react-router-dom';
import { useStudentCourseContext } from "../../courses/hooks/useCourse";

type CardCourseProps = {
  id: number;
  image: string;
  name: string;
  description: string;
  category: TCourse['category'];
  palette: TCourse['palette']; // Paleta de colores dinámica por curso
  status?: TCourseStudent['status'];
};

export default function CardCourse({ id, image, name, description, status, palette }: CardCourseProps) {
  const { loadLessonsCourse } = useStudentCourseContext();
  const navigate = useNavigate();


  // Maneja el click para cargar lecciones y navegar al curso
  const handleClickCourse = () => {
    loadLessonsCourse(id);
    // Navegación absoluta para evitar rutas anidadas incorrectas
    navigate(`/student/course/${id}/${name}`);
  };

  return (
    <div
      onClick={handleClickCourse}
      className="container-card-course"
      style={{
        backgroundColor: palette.surface, // Fondo dinámico
        color: palette.text,              // Color de texto principal
        border: `2px solid ${palette.accent}`, // Borde con color de acento
      }}
    >
      {/* Imagen del curso */}
      <img className="image-course-card" src={image} alt={`Imagen de ${name}`} />

      {/* Título del curso */}
      <h3 className="title-course-card" style={{ color: palette.brand }}>
        {name.toUpperCase()}
      </h3>

      {/* Descripción del curso */}
      <p className="description-course-card" style={{ color: palette.text }}>
        {description}
      </p>

      {/* Icono de progreso o completado */}
      <p className="icon-progress-course">
        {status === "completed" ? (
          <GrStatusGood color={palette.accent} /> // Ícono verde o destacado
        ) : (
          <RiProgress8Line color={palette.brand} /> // Ícono con color principal
        )}
      </p>
    </div>
  );
}
