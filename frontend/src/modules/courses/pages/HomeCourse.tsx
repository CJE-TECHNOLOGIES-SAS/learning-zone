// 📌 CourseHomePage.tsx
// Mejora: fondo oscuro con profundidad (TS-safe), animación GSAP del path y micro-interacciones

import { useEffect, useRef, useState, useLayoutEffect } from "react";
import type React from "react";
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
import Diploma from "../../../shared/animations/DiplomaAnimation";
import Atom from "../../../shared/animations/AtomAnimation";
import Frasco from "../../../shared/animations/Frasco";
import Atom2 from "../../../shared/animations/Atom2Animation";
import Globe from "../../../shared/animations/Globe";
import LightBulb from "../../../shared/animations/LightBulb";
import Planet from "../../../shared/animations/Planet";
import Microscope from "../../../shared/animations/Microscope";
import Helix from "../../../shared/animations/Helix";
import Abacus from "../../../shared/animations/Abacus";
import Horse from "../../../shared/animations/Horseshoe";
import Rocket from "../../../shared/animations/Rocket";
import Tassel from "../../../shared/animations/Tassel";
import Blackboard from "../../../shared/animations/Blackboard";
import Erlenmeyer from "../../../shared/animations/Erlenmeyer";
import Adn from "../../../shared/animations/Adn";

// ✅ GSAP (path + lecciones)
import gsap from "gsap";

// 🎨 Paleta por defecto
const defaultPalette: TCourse["palette"] = educationalPalettes.calmFocus;

// 📌 Posiciones en porcentaje respecto al tamaño del SVG (idénticas al original)
const lessonsPositions = [
  { top: 8, left: 12 },
  { top: 12, left: 26 },
  { top: 9, left: 41 },
  { top: 7, left: 60 },
  { top: 15, left: 77 },
  { top: 23, left: 64 },
  { top: 22, left: 48 },
  { top: 31, left: 28 },
  { top: 36, left: 53 },
  { top: 43, left: 72 },
  { top: 50, left: 53 },
  { top: 48, left: 31 },
  { top: 54, left: 14 },
  { top: 60, left: 33 },
  { top: 62, left: 50 },
  { top: 69, left: 68 },
  { top: 74, left: 50 },
  { top: 75, left: 28 },
  { top: 85, left: 14 },
  { top: 88, left: 35 },
  { top: 87, left: 55 },
  { top: 91, left: 76 },
];

// 📌 Generar un path suave con curvas (idéntico al original)
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
    const cpx = (p0x + p1x) / 2;
    const cpy = (p0y + p1y) / 2;
    d += ` Q ${cpx} ${cpy}, ${p1x} ${p1y}`;
  }
  return d;
}

// 🔖 Tipo para permitir CSS variables en inline style (TS-safe)
type CSSVars = React.CSSProperties & {
  ["--surface"]?: string;
  ["--text"]?: string;
};

export default function CourseHomePage() {
  const { lessons, renderContent, loadLessonsCourse, setPalette, setLessons } =
    useStudentCourseContext();
  const { id } = useParams();
  const idCourse = Number(id);

  const [palette, setPaletteState] = useState<TCourse["palette"]>(defaultPalette);
  const [nameCourse, setNameCourse] = useState<TCourse["name"]>("");

  // Refs
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

  // ✅ Animación del path (draw-on) al montar
  useEffect(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength();

    gsap.set(pathRef.current, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 2,
      ease: "power1.out",
    });
  }, []);

  // ✅ Animaciones de las lecciones
  const pathD = generateSmoothPath(lessonsPositions);
  const visualLessons = lessons.map((lesson, i) => ({
    ...lesson,
    position: lessonsPositions[i],
  }));

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".lesson-course", {
        opacity: 0,
        scale: 0.9,
        y: 16,
        duration: 0.5,
        stagger: 0.099,
        ease: "back.out(1.7)",
        clearProps: "",
      });
    }, containerRef);
    return () => ctx.revert();
  }, [visualLessons.length]);

  // 2) Micro-interacciones en hover
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1.12, y: -2, duration: 0.18, ease: "power2.out" });
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1, y: 0, duration: 0.18, ease: "power2.out" });
  };

  // ✅ Scroll a la lección relevante
  useEffect(() => {
    if (visualLessons.length > 0) {
      let targetLesson = visualLessons.find((l) => l.progressState === "in_progress");
      if (!targetLesson) targetLesson = visualLessons.find((l) => l.progressState === "blocked");
      if (!targetLesson) targetLesson = visualLessons[0];

      if (targetLesson) {
        const lessonElement = document.querySelector(`[data-lesson-id="${targetLesson.id}"]`);
        if (lessonElement) {
          const rect = lessonElement.getBoundingClientRect();
          const scrollTop = window.pageYOffset + rect.top - 200;
          window.scrollTo({ top: scrollTop, behavior: "smooth" });
        }
      }
    }
  }, [visualLessons]);

  // 🎯 Fondo oscuro con profundidad (TS-safe)
  const bgDark = [
    "radial-gradient(1200px 600px at 15% 10%, rgba(255,255,255,0.08), transparent 45%)",
    "radial-gradient(900px 500px at 80% 30%, rgba(255,255,255,0.07), transparent 40%)",
    "radial-gradient(circle at center, rgba(0,0,0,0.35), transparent 60%)",
    `linear-gradient(160deg, ${palette.text}, ${palette.accent})`,
  ].join(",");

  const containerStyle: CSSVars = {
    background: bgDark,
    backgroundBlendMode: "overlay, overlay, multiply, normal",
    color: palette.text,
    "--surface": palette.surface,
    "--text": palette.text,
    backdropFilter: "saturate(110%) contrast(105%)",
    WebkitBackdropFilter: "saturate(110%) contrast(105%)",
  };

  return (
    <div ref={containerRef} className="container-home-course" style={containerStyle}>
      <HeaderCourse key={idCourse} title={nameCourse} idCourse={idCourse} palette={palette} />

      <div className="map-container">
        {/* Animaciones decorativas */}
        <div className="container-animation-Diploma">
          <Diploma hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-Tassel">
          <Tassel hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-frasco">
          <Frasco hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-erlenmeyer">
          <Erlenmeyer hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-adn">
          <Adn hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-lightbulb">
          <LightBulb hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-abacus">
          <Abacus hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-microscope">
          <Microscope hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-horse">
          <Horse hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-rocket">
          <Rocket hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-planet">
          <Planet hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-atom2">
          <Atom2 hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>

        <div className="container-animation-helix">
          <Helix hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
        </div>
      </div>

      <div className="container-animation-atom">
        <Atom hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
      </div>

      <div className="container-animation-globe">
        <Globe hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
      </div>

      <div className="container-animation-blackboard">
        <Blackboard hoverIntensity={0.5} rotateOnHover hue={0} forceHoverState={false} />
      </div>

      {/* SVG del camino */}
      <svg className="path-svg-course" viewBox="0 0 1450 2090" preserveAspectRatio="xMidYMid meet">
        <path
          ref={pathRef}
          d={pathD}
          stroke={palette.brand}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
          style={{ filter: `drop-shadow(0 0 8px ${palette.brand})` }}
        />
      </svg>

      {/* Botones de lecciones */}
      {visualLessons.map((lesson, i) => (
        <div
          key={lesson.id}
          data-lesson-id={lesson.id}
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
              toast.error("Debes completar las lecciones anteriores para continuar");
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
                lesson.progressState === "complete"
                  ? palette.accent
                  : lesson.progressState === "blocked"
                  ? "#D6D4D4"
                  : "#EB9800",
              color: palette.text,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {lesson.progressState === "complete" ? <FaCheck /> : lesson.progressState === "blocked" ? <TbLock /> : <PiPlayLight />}
          </button>
          <span className="span-lesson-course">{`Lección ${i + 1}`}</span>
        </div>
      ))}
    </div>
  );
}
