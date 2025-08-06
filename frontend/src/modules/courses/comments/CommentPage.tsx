import { useEffect, useState,  useMemo } from 'react';
import { getSocket } from './socket';             // YA NO default
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

interface CommentPageProps {
  courseId: number;
  nameCourse: string;
}

export default function CommentPage({ courseId, nameCourse }: CommentPageProps) {
  // Estado para almacenar todos los comentarios del curso
  const [comments, setComments] = useState<TComment[]>([]);
  
  // Estado para almacenar la lista de todos los estudiantes
  const [allStudents, setAllStudents] = useState<TStudentAllComents[]>([]);
  
  // Estado para almacenar los IDs de estudiantes conectados
  const [listStudentsConnects, setListStudentsConnects] = useState<TStudent['id'][]>([]);
  
  // ✅ NUEVO: Estado global para controlar qué formulario de actualización está abierto
  // Solo un formulario puede estar abierto a la vez
  const [openUpdateFormId, setOpenUpdateFormId] = useState<number | null>(null);
/*   const prevConnectedIds = useRef<TStudent['id'][]>([]); */
  const student = useMemo(() => authStorage.getUser(), []);
  const socket = getSocket();  // Usamos la instancia compartida

  const handleBtnNavigate = useNavigationHandler()


  useEffect(() => {
    // Cargar la lista de estudiantes desde el almacenamiento local
    const allstudentsStorage = authStorage.getAllStudents();
    setAllStudents(allstudentsStorage || []);

    // Unirse al chat del curso específico
    socket.emit('join', {
      name: student?.name,
      courseId,
      token: authStorage.getToken(),
    });

    // ✅ Listener: Recibir la lista inicial de comentarios
    socket.on('commentList', (comments: TComment[]) => {
      setComments(comments);
    });

    // ✅ Listener: Recibir la lista de estudiantes conectados
    socket.on('listStudentsConnects', (data: TStudent['id'][] | []) => {
      setListStudentsConnects(data);
    });

    // ✅ Listener: Recibir nuevos comentarios en tiempo real
    socket.on('newComment', (comment: TComment) => {
      if (comment.courseId === courseId) {
        // Agregar el nuevo comentario al final de la lista
        setComments(prev => [...prev, comment]);
        // Mostrar toast de confirmación si el comentario es del usuario actual
        if (comment.nameStudent === student?.name) {
          toast.success('¡Tu comentario fue enviado y ya es visible para todos!');
        }
      }
    });

    // ✅ Listener: Recibir comentarios actualizados (eliminados o editados)
    socket.on('commentUpdated', (updatedComment: TComment) => {
      // Actualizar solo el comentario específico en la lista
      setComments(prev => prev.map(comment => 
        comment.id === updatedComment.id ? updatedComment : comment
      ));
    });

    // ✅ Listener: Recibir confirmaciones de acciones exitosas
    socket.on('commentSuccess', (data: { message: string }) => {
      toast.success(data.message);
    });

    // ✅ Listener: Recibir errores de acciones
    socket.on('commentError', (data: { message: string, details?: string }) => {
      toast.error(data.message);
    });

    // Limpieza de listeners cuando el componente se desmonta
    return () => {
      socket.off('commentList');
      socket.off('newComment');
      socket.off('listStudentsConnects');
      socket.off('commentUpdated');
      socket.off('commentSuccess');
      socket.off('commentError');
    };
  }, [student?.name, courseId]);

  // ✅ useEffect: Actualizar el estado de conexión de los estudiantes
  useEffect(() => {
    // Solo actualizar si hay estudiantes y la lista de conectados es válida
    if (allStudents.length === 0 || !Array.isArray(listStudentsConnects)) return;
    
    // Actualizar el estado de conexión de cada estudiante
    setAllStudents(prev =>
      prev.map(student => ({
        ...student,
        // Marcar como conectado si su ID está en la lista de conectados
        stateConnect: listStudentsConnects.includes(student.id),
      }))
    );
  }, [listStudentsConnects]);



  return (
    <div className={`comment-page ${nameCourse.toLowerCase()}`}>
      <button className="btn-back-comment" onClick={()=>handleBtnNavigate('/back')}>{<IoArrowBackCircleSharp/>}</button>

      <div className="left">
        <h2 className='title-comment'>Comentarios {nameCourse}</h2>
        <div className={`comments ${nameCourse.toLowerCase()}`}>
        {/* Renderizar solo los comentarios principales (no respuestas) */}
        {comments
          .filter(c => c.parentId === null) // Solo comentarios sin padre (principales)
          .map(c => (
            <Comment
              key={c.id}
              {...c} // Pasar todas las propiedades del comentario
              allComments={comments} // Lista completa para recursividad
              courseId={courseId}
              allStudents={allStudents}
              currentUserId={student!.id} // ID del usuario actual para permisos
              openUpdateFormId={openUpdateFormId} // Estado global del formulario abierto
              setOpenUpdateFormId={setOpenUpdateFormId} // Función para controlar formularios
            />
          ))}
        </div>
        <CommentForm courseId={courseId} />
      </div>
      <div className={`right ${nameCourse.toLowerCase()}`}>
        <UserList students={allStudents} />
      </div>
    </div>
  );
}
