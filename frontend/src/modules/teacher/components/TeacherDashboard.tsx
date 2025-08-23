import  { useEffect, useRef, useState } from 'react';
import { IoIosAdd } from "react-icons/io";
import '../styles/TeacherDashboard.css';
import { useTeacherCourseContext } from '../hooks/useCourseTeacher';
import CardCourseTeacher from './CardCourseTeacher';
import { useUser } from '../../auth/Hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { authStorage } from '../../../shared/Utils/authStorage';
import ViewCategories from '../../../shared/Components/AuthNavbar/ViewCategories';
import { RiMenuSearchLine } from "react-icons/ri";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const categoriesRef = useRef<HTMLDivElement>(null);            // contenedor del panel de categorías
  const [viewCategories, setViewCategories] = useState(false);    // visibilidad del panel
  const { coursesTeacher, refreshCoursesTeacher } = useTeacherCourseContext();
  const { user } = useUser();

  // Limpia datos de curso puntual al entrar al dashboard (no toca la lista)
  useEffect(() => {
    authStorage.clearTeacherCourseData();
  }, []);

  // Si no hay cursos ni en contexto ni en storage, recarga desde backend
  useEffect(() => {
    const storedCourses = authStorage.getCoursesTeacher();
    if (!coursesTeacher.length && (!storedCourses || storedCourses.length === 0)) {
      refreshCoursesTeacher();
    }
  }, [coursesTeacher, refreshCoursesTeacher]);

  // Cierra el panel de categorías al hacer clic fuera
  useEffect(() => {
    if (!viewCategories) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (categoriesRef.current && !categoriesRef.current.contains(target)) {
        setViewCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [viewCategories]);

  // Cerrar con ESC por UX
  useEffect(() => {
    if (!viewCategories) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewCategories(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [viewCategories]);

  const handleClickBtnAddCourse = () => {
    navigate('/teacher/courses/create');
  };

  return (


    <div className="container-teacher-dashboard">
      {/* Header */}
      <div className="header-teacher-dashboard">
        <button
          className="btn-space-teacher"
          onClick={() => navigate('/teacher/myspace')}
        >
          Mi Espacio
        </button>

        <h2 className="title-welcome-teacher">Bienvenido {user?.name}</h2>


        <div className='container-opc-filter-add'>
            <button
              className="icon-filter-categories"
              onClick={() => setViewCategories(v => !v)}
              aria-expanded={viewCategories}
              aria-controls="panel-categorias"
            >
              <RiMenuSearchLine />
            </button>
            <button className="btn-add-course" onClick={handleClickBtnAddCourse}>
              <IoIosAdd />
            </button>
        </div>
      </div>

      {/* Panel de categorías (se monta solo cuando está activo) */}
      {viewCategories && (
        <div id="panel-categorias" ref={categoriesRef}>
          <ViewCategories />
        </div>
      )}

      {/* Contenedor de cursos */}
      <div className="container-courses-teacher">
        <h2 className="title-container-courses-teacher">Mis Cursos</h2>

        {coursesTeacher.map((course) => (
          <CardCourseTeacher
            key={course.id}
            id={course.id}
            category={course.category}
            description={course.description}
            image={course.image}
            name={course.name}
            is_published={course.is_published}
            palette={course.palette}
          />
        ))}
      </div>
    </div>
  );
}
