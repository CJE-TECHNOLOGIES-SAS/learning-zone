// src/components/comment.tsx
import { useState } from 'react';
import CommentForm from './commentForm';
import GenerateColorFromName from '../../../shared/Utils/GenerateColorFromName';
import type { TComment, TDeleteComment, TStudentAllComents, TUpdateComment } from './types';
import './styles/comment.css';


import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { authStorage } from '../../../shared/Utils/authStorage';
import toast from 'react-hot-toast';
import { getSocket } from './socket';

// ✅ Interfaz que define las propiedades que recibe el componente Comment
// Esta interfaz extiende de TComment e incluye props adicionales para funcionalidad
interface CommentProps extends TComment {
  allComments: TComment[]; // Lista completa de comentarios (para filtrar respuestas recursivamente)
  courseId: number; // ID del curso al que pertenece este comentario
  allStudents: TStudentAllComents[]; // Lista de todos los estudiantes (para mostrar información)
  currentUserId: number; // ID del usuario actual (para verificar permisos de edición)
  openUpdateFormId: number | null; // Estado global: ID del comentario que tiene formulario abierto
  setOpenUpdateFormId: (id: number | null) => void; // Función para controlar qué formulario está abierto
}

// ✅ Componente principal para mostrar un comentario y sus posibles respuestas
// Este componente se renderiza recursivamente para mostrar comentarios anidados
export default function Comment({
  nameStudent, // Nombre del estudiante que escribió el comentario
  text, // Texto del comentario
  timestamp, // Fecha y hora del comentario
  id, // ID único del comentario
  courseId, // ID del curso al que pertenece
  allComments, // Lista completa de comentarios
  allStudents, // Lista de todos los estudiantes
  studentId, // ID del estudiante que escribió el comentario
  currentUserId, // ID del usuario actual
  openUpdateFormId, // Estado global del formulario abierto
  setOpenUpdateFormId // Función para controlar formularios
}: CommentProps) {
  
  // ✅ Estados locales del componente
  const [showReplyForm, setShowReplyForm] = useState(false); // Controlar formulario de respuesta
  const [showWindowInformation, setShowWindowInformation] = useState(false); // Controlar ventana de información
  const [textUpdate, setTextUpdate] = useState(text); // Texto temporal para edición
  const socket = getSocket();  // Usamos la instancia compartida
  

  // ✅ Función para eliminar un comentario (marcar como "eliminado")
  const handleDeleteComment = () => {
    // Verificar que el usuario tenga token de autenticación
    const token = authStorage.getToken();
    if (!token) {
      console.warn("No hay token, no se puede eliminar comentario");
      return;
    }

    // Crear objeto con datos para eliminar comentario
    const deleteComment: TDeleteComment = {
      idComment: id, // ID del comentario a eliminar
      token, // Token de autenticación
      idCourse:courseId

    }
    // Emitir evento al servidor para eliminar el comentario
    socket.emit('deleteComment', deleteComment);
  }
  // ✅ Función para actualizar un comentario
  const handleUpdateComment = () => {
    // Verificar que el usuario tenga token de autenticación
    const token = authStorage.getToken();
    if (!token) {
      console.warn("No hay token, no se puede actualizar comentario");
      return;
    }
    if(!textUpdate){
      toast.error('no hay contenido')
      return;
    }
    // Verificar que el texto haya cambiado
    if (text === textUpdate ) {
      toast.error('No has hecho cambios');
      return;
    }
    // Crear objeto con datos para actualizar comentario
    const updateComment: TUpdateComment = {
      idComment: id, // ID del comentario a actualizar
      token, // Token de autenticación
      text: textUpdate, // Nuevo texto del comentario
      idCourse:courseId
    }
    // Emitir evento al servidor para actualizar el comentario
    socket.emit('updateComment', updateComment);
    
    // ✅ Cerrar el formulario después de enviar (control global)
    setOpenUpdateFormId(null);
  }
  // ✅ Buscar información del estudiante para mostrar avatar y datos
  const student = allStudents.find(s => s.id === studentId);
  const numIdentification = student?.numIdentification || 0; // Número de identificación para generar color
  const prefixProfile = student?.prefixProfile || ''; // Inicial para mostrar en avatar
  
  // ✅ Generar color único basado en el nombre y número de identificación
  const avatarColor = GenerateColorFromName(nameStudent, numIdentification);

  // ✅ Filtrar las respuestas a este comentario (comentarios hijos)
  // Buscar comentarios que tengan este comentario como padre
  const replies = allComments.filter((c) => c.parentId === id);

  // ✅ Renderizado del componente
  return (
    <div className="comment">
      {/* ✅ Formulario de actualización - Solo se muestra si este comentario tiene el formulario abierto */}
      {openUpdateFormId === id && (
        <form 
          onSubmit={(e) => {
            e.preventDefault(); // Prevenir envío por defecto
            handleUpdateComment(); // Llamar función de actualización
          }} 
          className='container-form-update-comment'
        >
          <button className='btn-close-update-comment' onClick={() => setOpenUpdateFormId(null)}>Cerrar</button>
          <input  className='input-update-comment'
            type="text"
            value={textUpdate} // Texto temporal para edición
            onChange={(e) => setTextUpdate(e.target.value)} // Actualizar texto temporal
          />
          <input className='btn-update-comment' type="submit" value={'Actualizar'}/>
        </form>
      )}
      {/* ✅ Ventana modal con información del estudiante */}
      {showWindowInformation && (
        <div className="container-information-student">
          {/* Botón para cerrar la ventana */}
          <button className="close-info-btn" onClick={() => setShowWindowInformation(false)}>✖</button>
          {student ? (
            <>
              {/* Avatar con inicial y color único */}
              <p className='prefix-window' style={{'backgroundColor': avatarColor}}>{student.prefixProfile}</p>
              {/* Nombre completo del estudiante */}
              <p>{student.name} {student.lastNames}</p>
              {/* Email del estudiante */}
              <p>{student.email}</p>
              {/* Estado de conexión (🟢 conectado, 🔴 desconectado) */}
              <p>{student.stateConnect ? '🟢' : '🔴'}</p>
            </>
          ) : (
            <p>Información no disponible</p>
          )}
        </div>
      )}
      
      {/* ✅ Avatar clickeable que abre la ventana de información */}
      <div
        onClick={() => setShowWindowInformation(true)}
        className="avatar"
        style={{ backgroundColor: avatarColor, cursor: "pointer" }}
      >
        {prefixProfile} {/* Mostrar inicial del estudiante */}
      </div>

      {/* ✅ Cuerpo principal del comentario */}
      <div className="comment-body">

        {/* ✅ Metadatos del comentario: nombre del usuario y fecha */}
        <div className="meta">
          <span className="username">{nameStudent}</span>
          <span className="time">{timestamp}</span>
        </div>

        {/* ✅ Texto del comentario */}
        <div className="text">{text}</div>
        
        {/* ✅ Botones de opciones - Solo visibles para el autor del comentario */}
        {currentUserId === studentId && (
          <div className='container-opc-comment'>
            {/* Botón de eliminar comentario */}
            <button 
              onClick={() => handleDeleteComment()} 
              style={{'color':'#FF674A'}} 
              className='opc-delete-comment'
            >
              <MdDelete/>
            </button>
            
            {/* ✅ Botón de editar - Controla el estado global del formulario */}
            <button 
              onClick={() => setOpenUpdateFormId(openUpdateFormId === id ? null : id)} 
              style={{'color':'#FFCC4A'}} 
              className='opc-update-update'
            >
              <BiSolidEditAlt/> 
            </button>
          </div>
        )}

        {/* ✅ Botón para mostrar/ocultar formulario de respuesta */}
        <button onClick={() => setShowReplyForm(!showReplyForm)}>
          {showReplyForm ? 'Cancelar' : 'Responder'}
        </button>
        
        {/* ✅ Formulario para enviar una respuesta - Solo visible si showReplyForm es true */}
        {showReplyForm && (
          <CommentForm
            parentId={id} // Este comentario será el padre de la respuesta
            courseId={courseId} // Curso al que pertenece
            onReplySent={() => setShowReplyForm(false)} // Cerrar formulario al enviar
          />
        )}

        {/* ✅ Renderizado recursivo de las respuestas (comentarios hijos) */}
        <div className="replies">
          {replies.map((reply) => (
            <Comment
              key={reply.id} // Clave única para React
              {...reply} // Pasar todas las propiedades del comentario hijo
              allComments={allComments} // Lista completa para recursividad
              courseId={courseId} // Curso actual
              allStudents={allStudents} // Lista de estudiantes
              currentUserId={currentUserId} // ID del usuario actual
              openUpdateFormId={openUpdateFormId} // Estado global del formulario
              setOpenUpdateFormId={setOpenUpdateFormId} // Función para controlar formularios
            />
          ))}
        </div>
      </div>
    </div>
  );
}

