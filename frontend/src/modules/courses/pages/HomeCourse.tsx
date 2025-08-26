// 📌 CourseHomePage.tsx
// Componente original para mostrar el mapa de lecciones con ruta curva y posiciones predefinidas
// Mejora: animación del path SVG (draw-on) + animaciones en las lecciones (stagger al montar y hover micro-bounce)

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
import Diploma from '../../../shared/animations/DiplomaAnimation'
import Atom from '../../../shared/animations/AtomAnimation'
import Frasco from '../../../shared/animations/Frasco'
import Atom2 from '../../../shared/animations/Atom2Animation'
import Globe from '../../../shared/animations/Globe'
import LightBulb from '../../../shared/animations/LightBulb'
import Planet from '../../../shared/animations/Planet'
import Microscope from '../../../shared/animations/Microscope'
import Helix from '../../../shared/animations/Helix'
import Abacus from '../../../shared/animations/Abacus'
import Horse from '../../../shared/animations/Horseshoe'
import Rocket from '../../../shared/animations/Rocket'
import Tassel from '../../../shared/animations/Tassel'
import Blackboard from '../../../shared/animations/Blackboard'
import Erlenmeyer from '../../../shared/animations/Erlenmeyer'
import Adn from '../../../shared/animations/Adn'
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

  // Refs (pathRef se usa para la animación del path)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  // 📌 Cargar datos del curso y lecciones (idéntico al original)
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
      duration: 2,          // ajusta la duración si deseas
      ease: "power1.out",
    });
  }, []); // solo una vez al montar

  // ✅ Animaciones de las lecciones
  // 1) Stagger al montar / cuando cambie la lista visual (usa gsap.context para cleanup seguro)
  const pathD = generateSmoothPath(lessonsPositions);
  const visualLessons = lessons.map((lesson, i) => ({
    ...lesson,
    position: lessonsPositions[i],
  }));

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Aparece cada nodo .lesson-course con "pop" sutil
      gsap.from(".lesson-course", {
        opacity: 0,
        scale: .90,
        y: 16,
        duration: 0.5,
        stagger: .099,
        ease: "back.out(1.7)",
        clearProps: "",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [visualLessons.length]); // re-animar si cambia el número de lecciones

  // 2) Micro-interacciones en hover (escala y leve lift)
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1.12, y: -2, duration: 0.18, ease: "power2.out" });
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1, y: 0, duration: 0.18, ease: "power2.out" });
  };

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

    <div className="container-animation-Diploma">
      <Diploma
        hoverIntensity={0.5}
        rotateOnHover={true}
        hue={0}
        forceHoverState={false}
    />
    </div>
    
    <div className="container-animation-Tassel">
      <Tassel
        hoverIntensity={0.5}
        rotateOnHover={true}
        hue={0}
        forceHoverState={false}
    />
    </div>
    
    <div className="container-animation-frasco">
      <Frasco
      hoverIntensity={0.5}
      rotateOnHover={true}
      hue={0}
      forceHoverState={false}
      />
      </div>

      <div className="container-animation-erlenmeyer">
      <Erlenmeyer
      hoverIntensity={0.5}
      rotateOnHover={true}
      hue={0}
      forceHoverState={false}
      />
      </div>


      
      <div className="container-animation-adn">
      <Adn
      hoverIntensity={0.5}
      rotateOnHover={true}
      hue={0}
      forceHoverState={false}
      />
      </div>
    
    <div className="container-animation-lightbulb">
      <LightBulb
      hoverIntensity={0.5}
      rotateOnHover={true}
      hue={0}
      forceHoverState={false}
      />
      </div>

      <div className="container-animation-abacus">
      <Abacus
      hoverIntensity={0.5}
      rotateOnHover={true}
      hue={0}
      forceHoverState={false}
      />
      </div>

    <div className="container-animation-microscope">
      <Microscope
      hoverIntensity={0.5}
      rotateOnHover={true}
      hue={0}
      forceHoverState={false}
      />
      </div>

      <div className="container-animation-horse">
      <Horse
      hoverIntensity={0.5}
      rotateOnHover={true}
      hue={0}
      forceHoverState={false}
      />
      </div>

    <div className="container-animation-rocket">
      <Rocket
      hoverIntensity={0.5}
      rotateOnHover={true}
      hue={0}
      forceHoverState={false}
      />
      </div>
      
      <div className="container-animation-planet">
      <Planet
      hoverIntensity={0.5}
      rotateOnHover={true}
      hue={0}
      forceHoverState={false}
      />
      </div>

<div className="container-animation-atom2">
  <Atom2 
  hoverIntensity={0.5}
  rotateOnHover={true}
  hue={0}
  forceHoverState={false}
  />
  </div>

<div className="container-animation-helix">
  <Helix
  hoverIntensity={0.5}
  rotateOnHover={true}
  hue={0}
  forceHoverState={false}
  />
  </div>
</div>

<div className="container-animation-atom">
  <Atom
  hoverIntensity={0.5}
  rotateOnHover={true}
  hue={0}
  forceHoverState={false}
  />
</div>

<div className="container-animation-globe">
  <Globe
  hoverIntensity={0.5}
  rotateOnHover={true}
  hue={0}
  forceHoverState={false}
  />
</div>

<div className="container-animation-blackboard">
  <Blackboard
  hoverIntensity={0.5}
  rotateOnHover={true}
  hue={0}
  forceHoverState={false}
  />
</div>
        <svg
          className="path-svg-course"
          viewBox="0 0 1450 2090"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            ref={pathRef}                      // ← usado por GSAP
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

        {/* Botones de lecciones (mismo layout, ahora con hover animado) */}
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
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
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

  );
}
