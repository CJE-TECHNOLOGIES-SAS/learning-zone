import { useEffect, useRef, useState } from 'react';
import { getSocket } from './socket';
import Comment from './comment';
import CommentForm from './commentForm';
import UserList from './userList';
import BlockedComment from './BlockedComment';
import type { TComment, TStudentAllComents, TCommentBlocked } from './types';
import '../comments/styles/commentPage.css';
import { authStorage } from '../../../shared/Utils/authStorage';
import type { TStudent } from '../../types/User';
import toast from 'react-hot-toast';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { useNavigationHandler } from '../../../hooks/useNavigationHandler';
import type { TCourseTeacherResponse } from '../../teacher/types/Teacher';

// ✅ NUEVO: importa GSAP para animaciones
import gsap from 'gsap';

interface CommentPageProps {
  courseId: number;
  nameCourse: string;
  palette: TCourseTeacherResponse['palette']; // { brand, surface, text, accent }
}

export default function CommentPage({ courseId, nameCourse, palette }: CommentPageProps) {
  const [comments, setComments] = useState<TComment[]>([]);
  const [allStudents, setAllStudents] = useState<TStudentAllComents[]>([]);
  const [listStudentsConnects, setListStudentsConnects] = useState<TStudent['id'][]>([]);
  const [openUpdateFormId, setOpenUpdateFormId] = useState<number | null>(null);

  // 🚫 NUEVO: Estado para comentarios bloqueados
  const [blockedComments, setBlockedComments] = useState<TCommentBlocked[]>([]);

  const student = authStorage.getUser();
  const socket = getSocket();
  const handleBtnNavigate = useNavigationHandler();

  // 🎨 Valores directos de la paleta (con fallback por si viniera undefined)
  const brand  = palette?.brand  ?? '#3b82f6';
  const surface= palette?.surface?? '#ffffff';
  const text   = palette?.text   ?? '#111827';
  const accent = palette?.accent ?? '#f59e0b';

  // ✅ NUEVO: ref al contenedor scrolleable donde se renderizan los comentarios
  const commentsRef = useRef<HTMLDivElement>(null);

  // =========================================
  //   Ciclo de vida: conexión de socket
  // =========================================
  useEffect(() => {
    // Cargamos todos los estudiantes del storage para pintar el panel derecho
    const allstudentsStorage = authStorage.getAllStudents();
    setAllStudents(allstudentsStorage || []);

    // Notificamos la unión al curso/sala
    socket.emit('join', {
      name: student?.name,
      courseId,
      token: authStorage.getToken(),
    });

    // Listeners principales del chat
    socket.on('commentList', (c: TComment[]) => setComments(c));
    socket.on('listStudentsConnects', (ids: TStudent['id'][] | []) => setListStudentsConnects(ids));

    // Cuando llega un comentario nuevo, lo anexamos si corresponde a este curso
    socket.on('newComment', (c: TComment) => {
      if (c.courseId === courseId) {
        setComments(prev => [...prev, c]);
      }
    });

    // Actualización de comentarios (editar)
    socket.on('commentUpdated', (u: TComment) => {
      setComments(prev => prev.map(c => (c.id === u.id ? u : c)));
    });

    // Feedback UX
    socket.on('commentSuccess', (d: { message: string }) => toast.success(d.message));
    socket.on('commentError', (d: { message: string }) => toast.error(d.message));

    // 🚫 NUEVO: Listener para comentarios bloqueados por contenido inapropiado
    socket.on('commentBlocked', (blockedData: TCommentBlocked) => {
      toast.error(blockedData.message);
      console.log('🚫 Comentario bloqueado:', blockedData.originalText);

      // Agregar el comentario bloqueado al estado para mostrarlo en la UI
      setBlockedComments(prev => [...prev, blockedData]);
    });

    // Limpieza de listeners
    return () => {
      socket.off('commentList');
      socket.off('newComment');
      socket.off('listStudentsConnects');
      socket.off('commentUpdated');
      socket.off('commentSuccess');
      socket.off('commentError');
      socket.off('commentBlocked');
    };
  }, [student?.name, courseId]);

  // Mantener listado de conectados marcado en panel derecho
  useEffect(() => {
    if (allStudents.length === 0 || !Array.isArray(listStudentsConnects)) return;
    setAllStudents(prev => prev.map(s => ({ ...s, stateConnect: listStudentsConnects.includes(s.id) })));
  }, [listStudentsConnects, allStudents.length]);

  // =========================================
  //   ✅ NUEVO: Animaciones con GSAP
  // =========================================

  // 1) Stagger inicial: al primer render de la lista, animar los comentarios existentes
  useEffect(() => {
    const container = commentsRef.current;
    if (!container) return;

    // Seleccionamos solo los hijos directos (cada Comment raíz)
    const items = container.querySelectorAll(':scope > *');
    if (!items.length) return;

    // Stagger suave en carga inicial: fade + y
    gsap.from(items, {
      opacity: 0,
      y: 10,
      duration: 0.35,
      stagger: 0.04,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
    });

    // Autoscroll a la parte inferior en la carga inicial
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'auto',
    });
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← sin deps para que corra una vez

  // 2) Entrada de NUEVOS comentarios: animar el último cuando cambia la longitud
  useEffect(() => {
    const container = commentsRef.current;
    if (!container) return;
    if (comments.length === 0) return;

    // Último nodo direct child (nuevo comentario raíz)
    const last = container.querySelector(':scope > *:last-child') as HTMLElement | null;
    if (!last) return;

    // Si en tu <Comment /> agregas una clase "me" u "other" al wrapper,
    // aquí puedes variar la dirección del slide:
    const isMine = last.classList.contains('wrapper');

  gsap.from(last, {
    opacity: 0,
    x: isMine ? 40 : -40,    // entra desde más lejos
    y: 12,
    scale: 0.95,             // efecto "pop"
    duration: 0.45,
    ease: "back.out(1.7)",   // suave rebote al llegar
    clearProps: "all",       // limpia todas las props animadas
    onStart: () => {
      // 💡 animación rápida de glow al aparecer
      gsap.fromTo(
        last,
        { boxShadow: "0 0 0px rgba(0,0,0,0)" },
        { boxShadow: "0 0 14px rgba(0,0,0,0.15)", duration: 0.3, yoyo: true, repeat: 1 }
      );
    },
  });


    // Autoscroll para que siempre veas el último
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [comments.length]); // ← Se dispara solo cuando cambia el número de comentarios

  // =========================================
  //   Render
  // =========================================
  return (
    <div
      className="comment-page"
      style={{
        background: surface,           // fondo dinámico
        color: text                    // color de texto global
      }}
    >
      <button
        className="btn-back-comment"
        onClick={() => handleBtnNavigate('/back')}
        style={{ color: accent }}      // icono back con color accent
        aria-label="Volver"
        title="Volver"
      >
        <IoArrowBackCircleSharp />
      </button>

      {/* panel izquierdo */}
      <div
        className="left"
        style={{
          background: surface,
          boxShadow: `0 6px 18px ${brand}1f`,
        }}
      >
        {/* título con degradado SOLO en texto */}
        <h2
          className="title-comment"
          style={{
            background: `linear-gradient(90deg, ${brand} 0%, ${accent} 70%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: text // fallback
          }}
        >
          Comentarios {nameCourse}
        </h2>

        {/* listado de comentarios (SOLO padres) */}
        {/* ✅ NUEVO: ref={commentsRef} para controlar animación y autoscroll */}
        <div
          ref={commentsRef}
          className="comments"
          style={{
            background: surface,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)',
            // (opcional) si quieres asegurar contenedor scrolleable:
            // maxHeight: '60vh',
            // overflowY: 'auto',
          }}
        >
          {/* 🚫 NUEVO: Mostrar comentarios bloqueados primero */}
          {blockedComments.map((blockedComment, index) => (
            <BlockedComment
              key={`blocked-${index}`}
              timestamp={blockedComment.timestamp}
              userName={student?.name || 'Usuario'}
            />
          ))}

          {/* Comentarios normales */}
          {comments
            .filter(c => c.parentId === null)
            .map(c => (
              <Comment
                key={c.id}
                {...c}
                allComments={comments}
                courseId={courseId}
                allStudents={allStudents}
                currentUserId={student!.id}
                openUpdateFormId={openUpdateFormId}
                setOpenUpdateFormId={setOpenUpdateFormId}
              />
            ))}
        </div>

        <div style={{ borderTop: `1px solid ${accent}33`, paddingTop: 12 }}>
          <CommentForm courseId={courseId} />
        </div>
      </div>

      {/* panel derecho: listado de usuarios */}
      <div
        className="right"
        style={{
          background: `linear-gradient(180deg, ${surface}F2 0%, ${brand}0D 100%)`,
          border: `1px solid ${accent}33`,
          boxShadow: `0 6px 18px ${brand}1f`,
        }}
      >
        <UserList students={allStudents} />
      </div>
    </div>
  );
}
