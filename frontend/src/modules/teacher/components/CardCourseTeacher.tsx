import { GrStatusGood } from "react-icons/gr";
import { RiProgress8Line } from "react-icons/ri";
import type { TCourse } from "../../courses/types/CourseStudent";
import { useNavigate } from "react-router-dom";
import '../styles/CardCourseCreator.css'
import { COURSE_CATEGORY_LABELS } from "../../../shared/constant/CategoriesCourses";

type CardCourseProps = {
  id: number;
  image: string;
  name: string;
  description: string;
  category: TCourse["category"];
  palette: TCourse["palette"];
  is_published: boolean;
};

export default function CardCourseTeacher({
  id,
  image,
  name,
  description,
  category,
  palette,
  is_published,
}: CardCourseProps) {
  const navigate = useNavigate();

  const handleClickCourseTeacher = () => {
    navigate(`/teacher/courses/${id}`);
  };
  const catInfo =
    COURSE_CATEGORY_LABELS[category as keyof typeof COURSE_CATEGORY_LABELS] ??
    { label: category, color: palette.accent };
  return (
    <div
      onClick={handleClickCourseTeacher}
      className="container-card-course-teacher"
      style={{
        backgroundColor: palette.surface,
        color: palette.text,
        border: `2px solid ${palette.accent}`,
      }}
    >
      {/* Imagen del curso */}
      <img
        className="image-course-card-teacher"
        src={image}
        alt={`Imagen del curso ${name}`}
      />

      {/* Título del curso */}
      <h3
        className="title-course-card-teacher"
        style={{ color: palette.brand }}
      >
        {name.toUpperCase()}
      </h3>

      {/* Descripción */}
      <p
        className="description-course-card-teacher"
        style={{ color: palette.text }}
      >
        {description}
      </p>
      <span
        className="category-course-teacher"
        style={{
          color: '#fff',
          background: ` ${catInfo.color}`,
          paddingLeft: 8,
        }}
      >
        {catInfo.label}
      </span>


      {/* Publicado o no */}
      <div className="status-course-teacher">
        {is_published ? (
          <GrStatusGood color={palette.accent} title="Publicado" />
        ) : (
          <RiProgress8Line color={palette.brand} title="No publicado" />
        )}
      </div>
    </div>
  );
}
