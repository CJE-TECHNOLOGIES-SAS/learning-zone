/* Page donde se renderiza el contenido de una leccion */
import { IoArrowBackCircleSharp } from 'react-icons/io5'
import { HiDownload } from "react-icons/hi";
import '../styles/ContentPage.css'
import { useNavigationHandler } from '../../../hooks/useNavigationHandler'
import { useStudentCourseContext } from '../hooks/useCourse';
import toast from 'react-hot-toast';
export default function ContentPage() {
    const {content, renderEvaluation,currentLesson,palette} = useStudentCourseContext()
    const handleBtnNavigate = useNavigationHandler();
    console.log(content)
    if (!palette) return <div>Error: No se pudo cargar la paleta de colores.</div>;




  return (
  <div
    className="container-content-lesson"
    // Fondo y color de texto dinámicos según la paleta del curso.
    style={{
      backgroundColor: palette.surface,
      color: palette.text,
    }}
  >
    {/* Botón de volver */}
    <button
      className="btn-back-content"
      style={{
        color: palette.accent,             // Color de icono (acento para destacarlo)
        backgroundColor: palette.surface,  // Fondo igual al fondo general
      }}
      onClick={() => handleBtnNavigate('/back')}
    >
      <IoArrowBackCircleSharp />
    </button>

    {/* Título de la lección */}
    <h2
      className="title-content"
      style={{
        color: palette.brand,  // Usa color principal para destacar el título
      }}
    >
      {content?.title}
    </h2>

    {/* Texto de la lección */}
    <p
      className="text-content"
      style={{
        color: palette.text,   // Texto principal en color de texto
      }}
    >
      {content?.text}
    </p>

    {/* Contenido dinámico según el tipo */}
    {content?.contentType === 'image' ? (
      <img
        className="image-content"
        src={content.content}
        alt="contenido"
      />
    ) : content?.contentType === 'video' ? (
      <p
        className="content-content"
        style={{
          color: palette.text,
        }}
      >
        {content.content}
      </p>
    ) : (
      <video
        src={content?.content}
        controls
      />
    )}

    {/* Botón de descarga (solo si no es texto) */}
      <a
        className="btn-downloand-content"
        href={content?.content}
        download
        style={{
          backgroundColor: palette.brand, // Fondo destacado (color principal)
          color: palette.text,            // Icono/Texto en color de texto
        }}
      >
        <HiDownload />
      </a>

    {/* Botón Continuar (con validación de lección activa) */}
    <button
      className="btn-content-next"
      style={{
        backgroundColor: palette.accent, // Botón llamativo con color de acento
        color: palette.text,
      }}
      onClick={() => {
        if (!currentLesson) {
          toast.error('No hay lección activa para continuar.');
          return;
        }
        renderEvaluation(currentLesson.idCourse, currentLesson.id);
      }}
    >
      Continuar
    </button>
  </div>
);

}
