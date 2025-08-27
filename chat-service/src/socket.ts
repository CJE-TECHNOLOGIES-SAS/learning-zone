// socket.ts
import { Server, Socket } from 'socket.io';
import axios from 'axios';
import http from 'http';
import dotenv from 'dotenv';
import { TComment, TCommentDelete, TCommentSend, TUpdateComment } from './types';

dotenv.config();

// 🚫 FILTRO DE PALABRAS PROHIBIDAS
// Lista de palabras que no se permiten en el chat
const BAD_WORDS = [
  "groseria1", "groseria2", "tonto", "idiota", "estupido", "imbecil",
  "pendejo", "hijo de puta", "puta", "mierda", "carajo", "coño",
  "verga", "pendeja", "huevon", "huevona", "gilipollas", "cabron",
  "cabrona", "malparido", "malparida", "hijueputa", "gonorrea",
  "marica", "maricon", "maricona", "lesbiana", "gay", "puto",
  "puta", "perra", "perro", "zorra", "zorro", "bastardo", "bastarda"
];

/**
 * Función que sanitiza un mensaje detectando palabras prohibidas
 * @param message - El mensaje a verificar
 * @returns El mensaje sanitizado o null si contiene palabras prohibidas
 */
function sanitizeMessage(message: string): string | null {
  // Convertimos todo a minúsculas para comparar
  const lowerMessage = message.toLowerCase();

  // Verificamos si contiene alguna palabra prohibida
  for (const badWord of BAD_WORDS) {
    // Usamos regex para buscar la palabra exacta (con límites de palabra)
    const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
    if (regex.test(lowerMessage)) {
      console.log(`🚫 Mensaje bloqueado por palabra prohibida: "${badWord}"`);
      return null; // Bloquear el mensaje completamente
    }
  }

  return message; // Mensaje limpio, permitir
}

type TCommentResponse = {
  id: TComment['id'];
  name_student: TComment['nameStudent'];
  student_id: TComment['studentId'];
  course_id: TComment['courseId'];
  parent_id: TComment['parentId'];
  text: TComment['text'];
  timestamp: TComment['timestamp'];
};

type TListComments = {
  comments: TCommentResponse[] | [];
  list_ids_connects: number[] | [];
};

type TNewCommentResponse = {
  comment: TCommentResponse;
  list_ids_connects: number[];
};

// Cliente Axios optimizado
const api = axios.create({
  baseURL: process.env.FASTAPI_URL,
  timeout: 5000,
  httpAgent: new http.Agent({
    keepAlive: true,
    maxSockets: 50,
  }),
});

// Funciones auxiliares para centralizar las llamadas
async function deleteCommentRequest(idComment: number, idCourse: number, token: string) {
  return api.delete<TNewCommentResponse>(
    `/api/v1/comments/${idComment}?id_course=${idCourse}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

async function updateCommentRequest(idComment: number, idCourse: number, text: string, token: string) {
  return api.put<TNewCommentResponse>(
    `/api/v1/comments/${idComment}?id_course=${idCourse}`,
    { text }, // El backend espera "text", no "new_text"
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export const registerSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('🟢 Cliente conectado al socket');

    // Unirse al chat de un curso
    socket.on('join', async ({ name, courseId, token }) => {
      if (!token || !courseId || !name) {
        console.warn(`⚠️ Conexión rechazada (datos incompletos) -> name:${name}, courseId:${courseId}`);
        return;
      }
      socket.data.username = name;

      try {
        const res = await api.get<TListComments>(
          `/api/v1/comments?course_id=${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data.list_ids_connects;
        io.emit('listStudentsConnects', data);

        const comments: TComment[] = res.data.comments.map((c) => ({
          id: c.id,
          courseId: c.course_id,
          nameStudent: c.name_student,
          parentId: c.parent_id,
          studentId: c.student_id,
          text: c.text,
          timestamp: c.timestamp,
        }));

        socket.emit('commentList', comments);
      } catch (err: any) {
        console.error(`❌ Error obteniendo comentarios para curso ${courseId}:`, err.message);
      }
    });

    // Nuevo comentario
    socket.on('newComment', async (newComment: TCommentSend) => {
      const { token, text, parentId, courseId } = newComment;
      if (!token) {
        socket.emit('commentError', { message: 'No tienes permisos para comentar' });
        return;
      }

      // 🚫 FILTRAR MENSAJE ANTES DE ENVIARLO
      const sanitizedText = sanitizeMessage(text);
      if (sanitizedText === null) {
        // Mensaje bloqueado por contenido inapropiado
        console.log(`🚫 Mensaje bloqueado: "${text}"`);

        // Enviamos un mensaje especial al frontend indicando que fue bloqueado
        socket.emit('commentBlocked', {
          message: 'Comentario eliminado por contenido inapropiado',
          originalText: text,
          timestamp: new Date().toISOString()
        });

        // NO enviamos el mensaje al backend, solo notificamos al usuario
        return;
      }

      try {
        const res = await api.post<TNewCommentResponse>(
          '/api/v1/comments',
          { text: sanitizedText, parent_id: parentId, course_id: courseId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const comment: TComment = {
          id: res.data.comment.id,
          courseId: res.data.comment.course_id,
          parentId: res.data.comment.parent_id,
          nameStudent: res.data.comment.name_student,
          studentId: res.data.comment.student_id,
          timestamp: res.data.comment.timestamp,
          text: res.data.comment.text,
        };

        io.emit('newComment', comment);
        io.emit('listStudentsConnects', res.data.list_ids_connects);
        socket.emit('commentSuccess', { message: 'Comentario enviado exitosamente' });
      } catch (err: any) {
        socket.emit('commentError', {
          message: 'Error al enviar el comentario',
          details: err.response?.data?.detail || err.message
        });
      }
    });

    // Eliminar comentario
    socket.on('deleteComment', async (deleteData: TCommentDelete) => {
      const { token, idComment, idCourse } = deleteData;
      if (!token) {
        socket.emit('commentError', { message: 'No tienes permisos para comentar' });
        return;
      }

      try {
        const res = await deleteCommentRequest(idComment, idCourse, token);
        const comment: TComment = {
          id: res.data.comment.id,
          courseId: res.data.comment.course_id,
          parentId: res.data.comment.parent_id,
          nameStudent: res.data.comment.name_student,
          studentId: res.data.comment.student_id,
          timestamp: res.data.comment.timestamp,
          text: res.data.comment.text,
        };
        io.emit('commentUpdated', comment);
        io.emit('listStudentsConnects', res.data.list_ids_connects);
        socket.emit('commentSuccess', { message: 'Comentario eliminado exitosamente' });
      } catch (err: any) {
        socket.emit('commentError', {
          message: 'Error al eliminar el comentario',
          details: err.response?.data?.detail || err.message
        });
      }
    });

    // Actualizar comentario
    socket.on('updateComment', async (updateData: TUpdateComment) => {
      const { token, idComment, idCourse, text } = updateData;
      if (!token) {
        socket.emit('commentError', { message: 'No tienes permisos para comentar' });
        return;
      }

      // 🚫 FILTRAR MENSAJE ANTES DE ACTUALIZARLO
      const sanitizedText = sanitizeMessage(text);
      if (sanitizedText === null) {
        // Mensaje bloqueado por contenido inapropiado
        console.log(`🚫 Actualización bloqueada: "${text}"`);

        // Enviamos un mensaje especial al frontend indicando que fue bloqueado
        socket.emit('commentBlocked', {
          message: 'Comentario eliminado por contenido inapropiado',
          originalText: text,
          timestamp: new Date().toISOString()
        });

        // NO enviamos la actualización al backend, solo notificamos al usuario
        return;
      }

      try {
        const res = await updateCommentRequest(idComment, idCourse, sanitizedText, token);

        const comment: TComment = {
          id: res.data.comment.id,
          courseId: res.data.comment.course_id,
          parentId: res.data.comment.parent_id,
          nameStudent: res.data.comment.name_student,
          studentId: res.data.comment.student_id,
          timestamp: res.data.comment.timestamp,
          text: res.data.comment.text,
        };

        io.emit('commentUpdated', comment);
        io.emit('listStudentsConnects', res.data.list_ids_connects);
        socket.emit('commentSuccess', { message: 'Comentario actualizado exitosamente' });
      } catch (err: any) {
        socket.emit('commentError', {
          message: 'Error al actualizar el comentario',
          details: err.response?.data?.detail || err.message
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Cliente desconectado del socket');
    });
  });
};
