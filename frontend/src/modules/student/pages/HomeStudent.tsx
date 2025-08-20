import { useEffect, useRef, useState } from 'react';
import { useUser } from '../../auth/Hooks/useAuth';
import { useStudentCourseContext } from '../../courses/hooks/useCourse';
import CardCourse from '../components/CardCourse';
import { authStorage } from '../../../shared/Utils/authStorage';
import ViewCategories from '../../../shared/Components/AuthNavbar/ViewCategories';

import '../Styles/HomeStudent.css';
import { RiMenuSearchLine } from 'react-icons/ri';

export default function HomeStudent() {
  const { user } = useUser();
  const { courses, refreshCoursesStudent } = useStudentCourseContext();

  // Panel de categorías
  const [viewCategories, setViewCategories] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Evitar sobrescribir filtros: solo recarga si no hay nada en contexto ni en storage
  useEffect(() => {
    const storedCourses = authStorage.getCoursesStudent();
    if (!courses.length && (!storedCourses || storedCourses.length === 0)) {
      refreshCoursesStudent();
    }
  }, [courses, refreshCoursesStudent]);

  // Debug opcional
  useEffect(() => {
    console.log('HomeStudent - Courses updated:', courses.length, 'courses');
  }, [courses]);

  // Cerrar panel al hacer click fuera
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

  // Cerrar con ESC
  useEffect(() => {
    if (!viewCategories) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewCategories(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [viewCategories]);

  return (
    <div className="container-home-user">
      <div className="home-header">
        <div className='container-info-header-user'>
          <h1 className="home-title">Bienvenid@ {user?.name}</h1>
          <p className="home-paragraph">Selecciona un curso para comenzar</p>
          {/* Botón de categorías (misma UX que en AuthNavbar/TeacherDashboard) */}
          <button
            className="icon-filter-categories"
            onClick={() => setViewCategories(v => !v)}
            aria-expanded={viewCategories}
            aria-controls="panel-categorias-student"
            title="Filtrar por categoría"
          >
            <RiMenuSearchLine />

          </button>
        </div>

      </div>

      {/* Panel de categorías */}
      {viewCategories && (
        <div id="panel-categorias-student" ref={categoriesRef}>
          <ViewCategories />
        </div>
      )}

      <div className="container-courses">
        {courses.map(course => (
          <CardCourse
            key={course.id}
            id={course.id}
            name={course.name}
            description={course.description}
            image={course.image}
            category={course.category}
            palette={course.palette}
            status={'status' in course ? course.status : undefined}
          />
        ))}
      </div>
    </div>
  );
}
