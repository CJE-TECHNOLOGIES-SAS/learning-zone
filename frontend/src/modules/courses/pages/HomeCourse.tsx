// 📌 CourseHomePage.tsx
// Componente para mostrar un mapa animado de lecciones con ruta curva y posiciones predefinidas

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaCheck } from "react-icons/fa";
import { TbLock } from "react-icons/tb";
import { PiPlayLight } from "react-icons/pi";

import HeaderCourse from "../components/HeaderCourse";
import { useStudentCourseContext } from "../hooks/useCourse";
import { authStorage } from "../../../shared/Utils/authStorage";
import { educationalPalettes } from "../../../shared/theme/ColorPalettesCourses";

import type { TCourse } from "../types/CourseStudent";
import "../styles/HomeCourse.css";

const defaultPalette: TCourse["palette"] = educationalPalettes.calmFocus;

// 📌 Posiciones en porcentaje respecto al tamaño del SVG
const lessonsPositions = [
  { top: 8, left: 12 },
  { top: 12, left: 26 },
  { top: 9, left: 41 },
  { top: 7, left: 60 },
  { top: 15, left: 77 },
  { top: 23, left: 64 },
  { top: 22, left: 48 },
  { top: 29, left: 28 },
  { top: 36, left: 53 },
  { top: 43, left: 72 },
  { top: 50, left: 53 },
  { top: 48, left: 31 },
  { top: 54, left: 14 },
  { top: 65, left: 33 },
  { top: 62, left: 50 },
  { top: 69, left: 68 },
  { top: 82, left: 50 },
  { top: 80, left: 28 },
  { top: 89, left: 14 },
  { top: 99, left: 35 },
  { top: 95, left: 55 },
  { top: 98, left: 76 },
];

// 📌 Generar un path suave con curvas
function generateSmoothPath(points: { left: number; top: number }[]): string {
  if (points.length < 2) return "";

  const scaleX = 1450 / 100;
  const scaleY = 2090 / 100;

  let d = `M ${points[0].left * scaleX} ${points[0].top * scaleY}`;

  for (let i = 1; i < points.length; i++) {
    const p0x = points[i - 1].left * scaleX;
    const p0y = points[i - 1].top * scaleY;
    const p1x = points[i].left * scaleX;
    const p1y = points[i].top * scaleY;

    // Puntos de control para suavizar
    const cpx = (p0x + p1x) / 2;
    const cpy = (p0y + p1y) / 2;

    d += ` Q ${cpx} ${cpy}, ${p1x} ${p1y}`;
  }

  return d;
}

export default function CourseHomePage() {
  const { lessons, renderContent, loadLessonsCourse, setPalette, setLessons } =
    useStudentCourseContext();
  const { id } = useParams();
  const idCourse = Number(id);

  const [palette, setPaletteState] = useState<TCourse["palette"]>(defaultPalette);
  const [nameCourse, setNameCourse] = useState<TCourse["name"]>("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  // 📌 Cargar datos del curso y lecciones
  useEffect(() => {
    const courses = authStorage.getCoursesStudent();
    const selectedCourse = courses?.find((c) => c.id === idCourse);
    const pal = selectedCourse?.palette || defaultPalette;

    setPalette(pal);
    setPaletteState(pal);
    if (selectedCourse?.name) setNameCourse(selectedCourse.name);
  }, [idCourse]);

  useEffect(() => {
    const stored = authStorage.getLessonsStudents();

    if (!stored || stored.length === 0) {
      authStorage.removeLesson();
      authStorage.removeContent();
      authStorage.removeEvaluation();
      if (idCourse) loadLessonsCourse(idCourse);
    } else {
      setLessons(stored);
    }
  }, [idCourse]);

  const pathD = generateSmoothPath(lessonsPositions);
  const visualLessons = lessons.map((lesson, i) => ({
    ...lesson,
    position: lessonsPositions[i],
  }));

  return (
    <div
      ref={containerRef}
      className="container-home-course"
      style={{ backgroundColor: palette.surface, color: palette.text }}
    >
      <HeaderCourse
        key={idCourse}
        title={nameCourse}
        idCourse={idCourse}
        palette={palette}
      />

      <div className="map-container">
        {/* SVG del camino */}
        <svg
          className="path-svg-course"
          viewBox="0 0 1450 2090"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            ref={pathRef}
            d={pathD}
            stroke={palette.brand}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
            style={{
              filter: `drop-shadow(0px 0px 6px ${palette.brand})`,
            }}
          />
        </svg>

        {/* Botones de lecciones */}
        {visualLessons.map((lesson, i) => (
          <div
            key={lesson.id}
            title={lesson.name}
            className="lesson-course"
            style={{
              top: `${lesson.position.top}%`,
              left: `${lesson.position.left}%`,
            }}
            onClick={() => {
              if (lesson.progressState !== "blocked") {
                renderContent(lesson.idCourse, lesson);
              } else {
                toast.error(
                  "Debes completar las lecciones anteriores para continuar"
                );
              }
            }}
          >
            <button
              className={`btn-icon-lesson-course ${
                lesson.progressState === "complete"
                  ? "course-complete"
                  : lesson.progressState === "in_progress"
                  ? "course-in_progress"
                  : "course-blocked"
              }`}
              style={{
                backgroundColor:
                  lesson.progressState === "complete" ? palette.accent : "#1003",
                color: palette.text,
              }}
            >
              {lesson.progressState === "complete" ? (
                <FaCheck />
              ) : lesson.progressState === "blocked" ? (
                <TbLock />
              ) : (
                <PiPlayLight />
              )}
            </button>
            <span className="span-lesson-course">{`Lección ${i + 1}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
