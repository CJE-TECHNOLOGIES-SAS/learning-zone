import { useEffect, useState } from 'react';
import { getSocket } from './socket';
import Comment from './comment';
import CommentForm from './commentForm';
import UserList from './userList';
import type { TComment, TStudentAllComents } from './types';
import '../comments/styles/commentPage.css';
import { authStorage } from '../../../shared/Utils/authStorage';
import type { TStudent } from '../../types/User';
import toast from 'react-hot-toast';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { useNavigationHandler } from '../../../hooks/useNavigationHandler';
import type { TCourseTeacherResponse } from '../../teacher/types/Teacher';

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

  const student = authStorage.getUser();
  const socket = getSocket();
  const handleBtnNavigate = useNavigationHandler();

  // Valores directos de la paleta (con pequeño fallback por si viniera undefined)
  const brand  = palette?.brand  ?? '#3b82f6';
  const surface= palette?.surface?? '#ffffff';
  const text   = palette?.text   ?? '#111827';
  const accent = palette?.accent ?? '#f59e0b';

  useEffect(() => {
    const allstudentsStorage = authStorage.getAllStudents();
    setAllStudents(allstudentsStorage || []);

    socket.emit('join', {
      name: student?.name,
      courseId,
      token: authStorage.getToken(),
    });

    socket.on('commentList', (c: TComment[]) => setComments(c));
    socket.on('listStudentsConnects', (ids: TStudent['id'][] | []) => setListStudentsConnects(ids));
    socket.on('newComment', (c: TComment) => {
      if (c.courseId === courseId) {
        setComments(prev => [...prev, c]);
        if (c.nameStudent === student?.name) toast.success('¡Tu comentario fue enviado y ya es visible para todos!');
      }
    });
    socket.on('commentUpdated', (u: TComment) => {
      setComments(prev => prev.map(c => (c.id === u.id ? u : c)));
    });
    socket.on('commentSuccess', (d: { message: string }) => toast.success(d.message));
    socket.on('commentError', (d: { message: string }) => toast.error(d.message));

    return () => {
      socket.off('commentList');
      socket.off('newComment');
      socket.off('listStudentsConnects');
      socket.off('commentUpdated');
      socket.off('commentSuccess');
      socket.off('commentError');
    };
  }, [student?.name, courseId]);

  useEffect(() => {
    if (allStudents.length === 0 || !Array.isArray(listStudentsConnects)) return;
    setAllStudents(prev => prev.map(s => ({ ...s, stateConnect: listStudentsConnects.includes(s.id) })));
  }, [listStudentsConnects]);

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

        {/* listado de comentarios */}
        <div
          className="comments"
          style={{
            background: surface,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)',
          }}
        >
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

      {/* panel derecho */}
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
