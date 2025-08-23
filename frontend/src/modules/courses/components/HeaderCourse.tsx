import '../styles/HeaderCourse.css';
import { BsChatLeftTextFill } from "react-icons/bs";

import GetAllStudentsCommentsAPI from '../services/GetAllStudentsComments.server';
import { authStorage } from '../../../shared/Utils/authStorage';
import type { TStudentAllComents } from '../comments/types';
import { useNavigate } from 'react-router-dom';
import { useStudentCourseContext } from '../hooks/useCourse';
import type { TCourse, TCourseStudent } from '../types/CourseStudent';

// ✅ NUEVO: GSAP para animaciones
import gsap from 'gsap';
import { useEffect, useLayoutEffect, useRef } from 'react';

interface THeaderCourseProps {
  title: string;
  idCourse: TCourse['id'],
  palette: TCourseStudent['palette'];
}

export default function HeaderCourse({ title, idCourse, palette }: THeaderCourseProps) {
  // Obtenemos el progreso actual (0..100)
  const { progress } = useStudentCourseContext();
  const navigate = useNavigate();

  // ============================
  // Refs para animaciones GSAP
  // ============================
  const rootRef = useRef<HTMLDivElement>(null);          // scope para gsap.context (limpieza segura)
  const chatBtnRef = useRef<HTMLButtonElement>(null);     // micro-interacciones en el botón de chat
  const progressFillRef = useRef<HTMLSpanElement>(null);  // barra de progreso (ancho)
  const progressNumberRef = useRef<HTMLParagraphElement>(null); // contador numérico del progreso
  const prevProgressRef = useRef<number>(0);              // memoriza progreso previo para tween numérico

  // ============================
  // Animaciones al montar
  // ============================
  useLayoutEffect(() => {
    // Usamos gsap.context para que, si el componente se desmonta/re-monta,
    // GSAP limpie automáticamente estilos y listeners (evita efectos duplicados).
    const ctx = gsap.context(() => {
      // Entrada del título
      gsap.from(".title-course", {
        y: -111,
        opacity: 0,
        duration: .331,
        ease: "circ.in"
      });

      // Entrada del bloque de progreso
      gsap.from(".container-progress", {
        y: -110,
        opacity: 0,
        duration: 0.41,
        delay: 0.19,
        ease: "circ.in"
      });
      // Entrada del bloque de progreso
      gsap.from(".btn-chat-course", {
        y: -110,
        opacity: 0,
        duration: 0.41,
        delay: 0.19,
        ease: "circ.in"
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // ============================
  // Animaciones cuando cambia el progreso
  // ============================
  useEffect(() => {
    const end = Number(progress) || 0;
    const start = prevProgressRef.current || 0;

    // 1) Tween numérico en el <p> del porcentaje (0 → progress)
    if (progressNumberRef.current) {
      const obj = { n: start };
      gsap.to(obj, {
        n: end,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: () => {
          if (progressNumberRef.current) {
            progressNumberRef.current.textContent = `${Math.round(obj.n)}%`;
          }
        }
      });
    }

    // 2) Tween del ancho de la barra (width: 0% → N%)
    if (progressFillRef.current) {
      gsap.to(progressFillRef.current, {
        width: `${end}%`,
        duration: 0.6,
        ease: "power2.out"
      });
    }

    // Guarda el valor actual como "previo" para el próximo tween
    prevProgressRef.current = end;
  }, [progress]);

  // ============================
  // Micro-interacciones del botón de chat
  // ============================
  const onChatEnter = () => {
    if (!chatBtnRef.current) return;
    gsap.to(chatBtnRef.current, { scale: 1.12, y: -2, duration: 0.16, ease: "power2.out" });
  };

  const onChatLeave = () => {
    if (!chatBtnRef.current) return;
    gsap.to(chatBtnRef.current, { scale: 1, y: 0, duration: 0.16, ease: "power2.out" });
  };

  const handleComment = async () => {
    // Pequeño feedback al click (tap-down)
    if (chatBtnRef.current) {
      gsap.fromTo(chatBtnRef.current, { scale: 0.96 }, { scale: 1, duration: 0.16, ease: "power2.out" });
    }

    // Tu lógica original para preparar el chat
    const students = await GetAllStudentsCommentsAPI();
    const studentStorage: TStudentAllComents[] = students.map(student => ({
      id: student.id,
      numIdentification: student.num_identification,
      name: student.name,
      lastNames: student.last_names,
      email: student.email,
      prefixProfile: student.prefix_profile,
      stateConnect: false,
    }));
    authStorage.setAllStudents(studentStorage);

    if (idCourse) navigate(`/student/comments/${idCourse}`);
    else alert('No se encontró el curso correspondiente.');
  };

  return (
    <div
      ref={rootRef}
      className="header-course"
      // Mantengo tu glow, respetando la paleta
      style={{ boxShadow: `0 0 10px ${palette.accent}` }}
    >
      {/* Botón de chat (con micro-interacciones) */}
      <button
        ref={chatBtnRef}
        className="btn-chat-course"
        onClick={handleComment}
        onMouseEnter={onChatEnter}
        onMouseLeave={onChatLeave}
        style={{ color: palette.accent }}
        aria-label="Abrir comentarios del curso"
        title="Comentarios"
      >
        <BsChatLeftTextFill style={{ background: 'none' }} />
      </button>

      {/* Título del curso (entra desde arriba con fade) */}
      <h2
        className="title-course"
        style={{ color: palette.text }}
      >
        Curso de {title}
      </h2>

      {/* Progreso (barra + número con tween) */}
      <div className="container-progress">
        <p
          ref={progressNumberRef}
          className="progress-course-number"
          style={{ color: palette.text }}
        >
          {/* Valor inicial; GSAP lo animará a {progress}% */}
          {typeof progress === 'number' ? `${Math.round(progress)}%` : '0%'}
        </p>

        <span className="progress-bar-bg" />

        <span
          ref={progressFillRef}
          className="progress-bar-fill"
          // Iniciamos en 0% para que el primer render no “salte”
          style={{
            width: '0%',
            borderBottomColor: palette.brand
          }}
        />
      </div>
    </div>
  );
}
