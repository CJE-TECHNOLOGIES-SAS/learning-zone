// ----------------------
// Importaciones necesarias
// ----------------------
import { useState } from 'react'; // Manejo de estado en componentes/hook
import { useNavigate } from 'react-router-dom'; // Navegación programática
import toast from 'react-hot-toast'; // Notificaciones emergentes

// Importa las paletas de colores y sus tipos
import {
  educationalPalettes,
  type TColorPalette, // Tipo que define la estructura de una paleta de colores
  type TPaletteNames  // Tipo que define los nombres válidos de paletas
} from '../../../../shared/theme/ColorPalettesCourses';

// Tipos de datos para curso
import type { TCourse } from '../../../courses/types/CourseStudent';
import type { TCourseTeacherSend } from '../../types/Teacher';

// Servicio que envía el curso al backend
import CreateCourseAPI from '../../services/Course/CreateCourse.server';
import { useTeacherCourseContext } from '../useCourseTeacher';
import { authStorage } from '../../../../shared/Utils/authStorage';

// -------------------------------------------------
// Hook personalizado para manejar el formulario de creación de cursos
// -------------------------------------------------
export function useFormCreateCourse() {
  const { loadInfoCourse, refreshCoursesTeacher } = useTeacherCourseContext();
  const navigate = useNavigate(); // Hook de React Router para redirigir al usuario

  // ----------------------
  // Estado principal del formulario
  // ----------------------
  const [formData, setFormData] = useState<{
    name: string;                     // Nombre del curso
    description: string;              // Descripción del curso
    category: TCourse['category'];    // Categoría (usa el tipo de category de TCourse)
    image: File | null;               // Imagen del curso
    palette: TPaletteNames;           // Nombre de la paleta seleccionada
    paletteColors: TColorPalette;     // Colores reales de la paleta seleccionada
  }>({
    name: '', // Inicialmente vacío
    description: '', // Inicialmente vacío
    category: 'otro', // Valor por defecto en "otro"
    image: null, // Sin imagen inicial
    palette: 'vibrantLearning', // Paleta inicial
    paletteColors: educationalPalettes['vibrantLearning'] // Colores de la paleta inicial
  });

  // ----------------------
  // Estado para errores, envío y éxito
  // ----------------------
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({}); // Errores por campo
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de "enviando" para deshabilitar el botón
  const [submitSuccess, setSubmitSuccess] = useState(false); // Estado para mostrar mensaje de éxito

  // ----------------------
  // Manejar cambios en campos de texto/select
  // ----------------------
  const handleInputChange = (
    field: keyof typeof formData, // El campo a actualizar (name, description, etc.)
    value: string | TPaletteNames | TColorPalette // El nuevo valor (puede ser string, nombre de paleta o colores)
  ) => {
    setFormData(prev => ({
      ...prev,     // Copia el estado anterior
      [field]: value // Actualiza solo el campo que cambió
    }));
  };

  // ----------------------
  // Manejar cambio de paleta de colores
  // ----------------------
  const handlePaletteChange = (paletteName: TPaletteNames) => {
    const paletteColors = educationalPalettes[paletteName]; // Obtiene los colores según el nombre
    setFormData(prev => ({
      ...prev,
      palette: paletteName,      // Cambia el nombre de la paleta seleccionada
      paletteColors              // Actualiza los colores en base a la selección
    }));
  };

  // ----------------------
  // Manejar cambio de imagen
  // ----------------------
  const handleImageChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      image: file // Guarda el archivo en el estado
    }));
  };

  // ----------------------
  // Validar todos los campos antes de enviar
  // ----------------------
  const validate = () => {
    // Objeto para guardar mensajes de error
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    // Validaciones básicas
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria";
    if (!formData.category) newErrors.category = "Selecciona una categoría";
    if (!formData.image) newErrors.image = "Debes subir una imagen";

    setErrors(newErrors); // Actualiza el estado de errores

    // Devuelve true si no hay errores, false si hay al menos uno
    return Object.keys(newErrors).length === 0;
  };

  // ----------------------
  // Manejar el envío del formulario
  // ----------------------
  // [NUEVO]: tipamos el evento como HTMLFormElement para acceder a e.nativeEvent.submitter
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evita recargar la página
    console.log(formData)

    // [NUEVO]: obtener el botón que disparó el submit (el "submitter")
    // Esto nos permite deshabilitarlo "al instante" sin esperar el re-render de React.
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;

    // [NUEVO]: deshabilitar inmediatamente el botón para bloquear doble click rápido
    if (submitter) submitter.disabled = true;

    // Paso 1: Validar antes de enviar
    if (!validate()) {
      // [NUEVO]: si la validación falla, re-habilitamos el botón y salimos
      if (submitter) submitter.disabled = false;
      return; // Si hay errores, detener aquí
    }

    // Paso 2: Preparar estados de envío
    setIsSubmitting(true);     // Marca que está enviando
    setSubmitSuccess(false);   // Reinicia el mensaje de éxito

    // Paso 3: Preparar datos para enviar al backend
    const coursesend: TCourseTeacherSend = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      image: formData.image,
      name_palette: formData.palette,
      palette: formData.paletteColors
    };

    // Paso 4: Intentar enviar
    try {
      const idCourse = await CreateCourseAPI(coursesend); // Llamada al API
      if (idCourse) {
        toast.success("¡Curso creado exitosamente!");
        // Limpiar cache de cursos para mostrar el nuevo curso
        authStorage.removeCoursesTeacher();
        await refreshCoursesTeacher();
        setSubmitSuccess(true);
        navigate(`/teacher/courses/${idCourse}`);
      }
    } catch (error) {
      toast.error("Ocurrió un error al crear el curso"); // Notificación de error
      console.error(error); // Log en consola para depuración
    } finally {
      setIsSubmitting(false); // Quita el estado de envío, pase lo que pase
      // [NUEVO]: re-habilitar el botón (si sigues en la vista actual); si navegas, no afecta
      if (submitter) submitter.disabled = false;
    }
  };

  // ----------------------
  // Exponer funciones y estados al componente que use este hook
  // ----------------------
  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    submitSuccess,
    handleInputChange,
    handlePaletteChange,
    handleImageChange,
    handleSubmit
  };
}
