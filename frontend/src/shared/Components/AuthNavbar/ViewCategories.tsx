import { COURSE_CATEGORY_LABELS } from '../../constant/CategoriesCourses';
import toast from 'react-hot-toast';
import './Styles/ViewCategories.css'

import { authStorage } from '../../Utils/authStorage';
import { useStudentCourseContext } from '../../../modules/courses/hooks/useCourse';
import { useTeacherCourseContext } from '../../../modules/teacher/hooks/useCourseTeacher';
import GetCoursesStudentByCategoryAPI from '../../../modules/courses/services/GetCoursesStudentByCategory.server';
import GetCoursesAPI from '../../../modules/courses/services/GetCourses';
import GetCoursesTeacherByCategoryAPI from '../../../modules/teacher/services/Course/GetCoursesTeacherByCategoryAPI.server';
import GetCoursesTeacherAPI from '../../../modules/teacher/services/Course/GetCoursesTeacher.server';
import type { TCourse } from '../../../modules/courses/types/CourseStudent';
import type { TUserProfileToken } from '../../../modules/types/User';

export default function ViewCategories() {
  const { setCourses } = useStudentCourseContext();
  const { setCoursesTeacher } = useTeacherCourseContext();
  const role: TUserProfileToken['role'] | null = authStorage.getRole();

  const handleGetCoursesCategory = async (category: TCourse['category']) => {
    try {
      // ===== MANEJO PARA ESTUDIANTES =====
      if (role === 'student') {
        let data; // Variable para almacenar los cursos obtenidos

        // 🔄 LÓGICA DE DECISIÓN: ¿Qué servicio usar para estudiantes?
        if (category === 'vertodo') {
          // Si seleccionó "Ver Todo", obtener TODOS los cursos del estudiante
          data = await GetCoursesAPI(); // Servicio que trae todos los cursos del estudiante
        } else {
          // Si seleccionó una categoría específica, filtrar por esa categoría
          data = await GetCoursesStudentByCategoryAPI(category); // Servicio que filtra
        }

        // ===== PROCESAMIENTO DE RESULTADOS PARA ESTUDIANTES =====
        if(data.length > 0){
          // ✅ Si encontró cursos:
          authStorage.clearAllCoursesData() // Limpiar todos los datos anteriores
          authStorage.setCoursesStudent(data) // Guardar nuevos cursos en localStorage

          // Mostrar mensaje de éxito apropiado según la categoría
          toast.success(`${category === 'vertodo' ? 'Todos los cursos cargados' : `Cursos de ${category} cargados`}`);
        } else {
          toast.error(`${category === 'vertodo' ? 'No tienes cursos disponibles' : `No hay cursos de ${category}`}`);
        }

        // ===== SINCRONIZACIÓN CON EL CONTEXTO (ESTUDIANTES) =====
        try {
          // Actualizar el contexto local con los nuevos datos
          setCourses(data); // Actualizar contexto de estudiantes
          // 📡 DISPARAR EVENTO PERSONALIZADO: Notificar al provider que localStorage cambió
          // Este evento es capturado por StudentCourseProvider para sincronizar el contexto global
          window.dispatchEvent(new CustomEvent('coursesStudentUpdated'));
        } catch (error) {
          // Si hay error en la sincronización, el polling del provider lo resolverá
          console.error('ViewCategories - Error updating student context or dispatching event:', error);
        }
      } else {
        // ===== MANEJO PARA PROFESORES =====
        let data; // Variable para almacenar los cursos obtenidos

        // 🔄 LÓGICA DE DECISIÓN: ¿Qué servicio usar?
        if (category === 'vertodo') {
          // Si seleccionó "Ver Todo", obtener TODOS los cursos del profesor
          data = await GetCoursesTeacherAPI(); // Servicio que trae todos los cursos
        } else {
          // Si seleccionó una categoría específica, filtrar por esa categoría
          data = await GetCoursesTeacherByCategoryAPI(category); // Servicio que filtra
        }

        // ===== PROCESAMIENTO DE RESULTADOS =====
        if(data.length > 0){
          // ✅ Si encontró cursos:
          authStorage.clearAllCoursesData() // Limpiar todos los datos anteriores
          authStorage.setCoursesTeacher(data) // Guardar nuevos cursos en localStorage

          // Mostrar mensaje de éxito apropiado según la categoría
          toast.success(`${category === 'vertodo' ? 'Todos los cursos cargados' : `Cursos de ${category}`}`);
        }else{
          toast.error(`${category === 'vertodo' ? 'No hay cursos disponibles' : `No hay cursos de ${category}`}`);
        }

        // ===== SINCRONIZACIÓN CON EL CONTEXTO =====
        try {
          // Actualizar el contexto local con los nuevos datos
          setCoursesTeacher(data);
          console.log('ViewCategories - Updated context')

          // 📡 DISPARAR EVENTO PERSONALIZADO: Notificar al provider que localStorage cambió
          // Este evento es capturado por TeacherCourseProvider para sincronizar el contexto global
          window.dispatchEvent(new CustomEvent('coursesTeacherUpdated'));
        } catch (error) {
          // Si hay error en la sincronización, el polling del provider lo resolverá
          console.error('ViewCategories - Error updating context or dispatching event:', error);
        }
      }
    } catch (error) {
      // ❌ ERROR DETALLADO: Capturar y mostrar información específica del error
      console.error('ViewCategories - Error completo:', error);
      console.error('ViewCategories - Categoría que falló:', category);
      console.error('ViewCategories - Rol del usuario:', role);

      // Mostrar error más específico según el tipo
      if (error instanceof TypeError) {
        toast.error('Error de conexión. Verifica tu internet.');
      } else if (error instanceof Error) {
        toast.error(`No hay cursos asociados a ${category}`);
      } else {
        toast.error('Ups, ocurrió un error inesperado al cargar los cursos.');
      }
    }
  };

  return (
    <div className='container-view-categories'>
      {Object.entries(COURSE_CATEGORY_LABELS).map(([key, { label, color }]) => (
        <button
          key={key}
          className='btn-category'
          color='#fff'
          style={{ backgroundColor: `${color}` }}
          onClick={() => handleGetCoursesCategory(key as TCourse['category'])}
        >
          {label}
        </button>
      ))}

    </div>
  );
}
