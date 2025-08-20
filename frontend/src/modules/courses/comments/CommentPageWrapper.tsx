import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import CommentPage from './CommentPage';
import { authStorage } from '../../../shared/Utils/authStorage';
import { connectSocket, disconnectSocket } from './socket';

export default function CommentPageWrapper() {
  const { courseId } = useParams();
  const numericCourseId = Number(courseId);

  useEffect(() => {
    const socket = connectSocket();

    socket.on('connect', () => {
      const token = authStorage.getToken();
      socket.emit('join', {
        name: authStorage.getUser()?.name,
        courseId: numericCourseId,
        token,
      });
    });

    return () => {
      socket.off('connect');  // limpia listener
      disconnectSocket();
    };
  }, [numericCourseId]);

  const cursos = authStorage.getCoursesStudent();
  const curso = cursos.find(c => c.id === numericCourseId);
  if (!curso) return <div>Curso no encontrado</div>;

  return <CommentPage courseId={numericCourseId} nameCourse={curso.name} palette ={curso.palette} />;
}
