import HeaderCourse from "../components/HeaderCourse";
import { useEffect, useRef, useState } from "react";
import { authStorage } from "../../../shared/Utils/authStorage";
import toast from "react-hot-toast";
import { LuBanana } from "react-icons/lu";
import MonkeyIcon from '../../../assets/learningZone/monkey.png'
import { useCourseContext } from "../hooks/useCourse";
import "./ExcelHomePage.css";
import { FaCheck } from 'react-icons/fa';
import { TbLock } from 'react-icons/tb';
import { PiPlayLight } from 'react-icons/pi';

export default function ExcelHomePage() {
  const  {lessons,renderContent,loadLessonsCourse} = useCourseContext();
  const courses = authStorage.getCourses()
  const idCourse = courses!.find(course => course.name.toLowerCase() === 'excel')?.id;

  // Estado para la posición y ángulo de la estrella
  const [carPos, setCarPos] = useState({ x: 0, y: 0, angle: 0 });
  // Referencia al path SVG para calcular posiciones
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
      authStorage.removeLessons();
      authStorage.removeLesson()
      authStorage.removeContent()
      authStorage.removeEvaluation()
      loadLessonsCourse(idCourse)
  }, []);

  // 🔧 Genera curvas específicas según el índice del nodo destino
  function generateSmoothPath(points: { left: number; top: number }[]): string {
    if (points.length < 2) return "";

    // Comienza en la primera lección
    let d = `M ${points[0].left + 8} ${points[0].top + 40}`;

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];

      // Alterna la intensidad de la curva: 0.35, 0.5, 0.65, etc.
      const controlFactor = 0.35 + 0.15 * (i % 3); // Cambia entre 0.35, 0.5, 0.65

      // Zigzag: alterna la dirección del zigzag en cada segmento
      const zigzag = (i % 2 === 0 ? 1 : -1) * 111; // 24px de zigzag, alternando arriba/abajo

      // Puntos de control para la curva de Bézier
      const c1x = p0.left + 8 + (p1.left - p0.left) * controlFactor;
      const c1y = p0.top + 40 + (p1.top - p0.top) * controlFactor + zigzag;
      const c2x = p1.left + 8 - (p1.left - p0.left) * controlFactor;
      const c2y = p1.top + 40 - (p1.top - p0.top) * controlFactor - zigzag;

      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p1.left + 8} ${p1.top + 40}`;
    }

    return d;
  }
  // Por ahora, puedes copiar la estructura de WordHomePage o ajustarla según tus necesidades
  const lessonsPositions = [
    { top: 190, left: 160 },
    { top: 360, left: 420 },
    { top: 220, left: 660 },
    { top: 150, left: 940 },
    { top: 320, left: 1180 },
    { top: 520, left: 990 },
    { top: 450, left: 740 },
    { top: 640, left: 460 },
    { top: 780, left: 830 },
    { top: 930, left: 1110 },
    { top: 1080, left: 810 },
    { top: 980, left: 500 },
    { top: 1150, left: 260 },
    { top: 1380, left: 540 },
    { top: 1280, left: 780 },
    { top: 1480, left: 1050 },
    { top: 1740, left: 780 },
    { top: 1640, left: 460 },
    { top: 1880, left: 260 },
    { top: 2120, left: 580 },
    { top: 2200, left: 920 },
    { top: 2140, left: 1210 }
  ];

  const visualLessons = lessons.map((lesson, i) => ({
    ...lesson,
    position: lessonsPositions[i],
  }));

  const pathD = generateSmoothPath(lessonsPositions);

  // Animación de la estrella (igual que en WordHomePage)
  useEffect(() => {
    if (!pathRef.current) return;
    const inProgressIdx = lessons.findIndex(l => l.progressState === "in_progress");
    const targetIdx = inProgressIdx === -1 ? 0 : inProgressIdx;
    const totalLen = pathRef.current.getTotalLength();
    let targetPointLen = 0;
    if (targetIdx > 0) {
      const targetPos = lessonsPositions[targetIdx];
      let minDist = Infinity;
      for (let l = 0; l <= totalLen; l += 2) {
        const pt = pathRef.current.getPointAtLength(l);
        const dist = Math.hypot(pt.x - (targetPos.left + 8), pt.y - (targetPos.top + 40));
        if (dist < minDist) {
          minDist = dist;
          targetPointLen = l;
        }
      }
    }
    let animFrame: number | undefined;
    let start: number | null = null;
    const from = 0;
    const duration = 4000;
    function easeInOutCubic(x: number) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }
    function animateToTarget(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const tRaw = Math.min(1, elapsed / duration);
      const t = easeInOutCubic(tRaw);
      const len = from + (targetPointLen - from) * t;
      if (pathRef.current) {
        const point = pathRef.current.getPointAtLength(len);
        const delta = 2;
        const prev = pathRef.current.getPointAtLength(Math.max(0, len - delta));
        const angle = Math.atan2(point.y - prev.y, point.x - prev.x) * 180 / Math.PI;
        setCarPos({ x: point.x, y: point.y, angle });
      }
      if (tRaw < 1) {
        animFrame = requestAnimationFrame(animateToTarget);
      }
    }
    if (pathRef.current) {
      const point = pathRef.current.getPointAtLength(0);
      setCarPos({ x: point.x, y: point.y, angle: 0 });
    }
    animFrame = requestAnimationFrame(animateToTarget);
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
    // eslint-disable-next-line
  }, [pathD, lessons.map(l => l.progressState).join("")]);

  return (
    <div className="container-home-excel">
      <HeaderCourse title="Excel" />
      <svg
        className="path-svg-excel"
        width={1400}
        height={2480}
        viewBox={`0 0 1450 2090`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Carretera: fondo verde claro */}
        <path
          ref={pathRef}
          d={pathD}
          stroke="#6c5624"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
          style={{ filter: 'drop-shadow(0px 0px 6px #6c5624)' }}
        />
        {/* Banana al final del path */}
        {pathRef.current && (() => {
          const len = pathRef.current.getTotalLength();
          const pt = pathRef.current.getPointAtLength(len);
          return (
            <g
              style={{
                transform: `translate(${pt.x - 18}px, ${pt.y - 36}px)`,
                transition: "transform 0.2s"
              }}
            >
              <foreignObject width={46} height={46}>
                <div style={{ width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LuBanana size={46} color="#ffc345" />
                </div>
              </foreignObject>
            </g>
          );
        })()}
        <g
          style={{
            transform: `translate(${carPos.x - 20}px, ${carPos.y - 15}px) rotate(${carPos.angle}deg)`,
            transformOrigin: "20px 15px",
            transition: "transform 0.1s linear"
          }}
        >
         <foreignObject width={46} height={46}>
            <div style={{ 
              width: 46, 
              height: 46, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
               <img src={MonkeyIcon} alt="Simio" style={{ width: 40, height: 40 }} />
            </div>
          </foreignObject>
        </g>
      </svg>
      <div className="container-lessons-excel">
        {visualLessons.map((lesson, i) => (
          <div
            key={lesson.id}
            title={lesson.name}
            className={`lessons-excel state-excel-${lesson.progressState}`}
            style={{
              top: `${lesson.position.top}px`,
              left: `${lesson.position.left}px`,
              position: "absolute",
            }}
            onClick={() => {
              if (lesson.progressState !== 'blocked') {
                renderContent(lesson.idCourse, lesson)
              } else {
                toast.error('Ups! Debes completar las lecciones anteriores para continuar')
              }
            }}
          >
            <button className={`btn-icon-lesson-excel excel-${lesson.progressState}`}>
              {lesson.progressState === "complete" ? (
                <FaCheck />
              ) : lesson.progressState === "blocked" ? (
                <TbLock />
              ) : (
                <PiPlayLight />
              )}
            </button>
            <span className="span-lesson-excel">{`lección ${i + 1}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
