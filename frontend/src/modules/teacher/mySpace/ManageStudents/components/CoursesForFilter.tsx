/* Componnete que tiene los cursos publicados para elegir */
import { useManageStudents } from '../hook/useManageStudents'
import '../styles/CoursesForFilter.css'
import { TbXboxX } from "react-icons/tb";
type Props = {
  onToggleCoursesForFilter: () => void; // cierra el panel externo
};
export default function CoursesForFilter({onToggleCoursesForFilter}:Props) {
    /* Obtener lo cursos disponibles para filtrar */
    const {coursesFilter} = useManageStudents()
    const {loadInfoStudentRegisterByCourse} = useManageStudents()

  return (
    <div className='container-courses-filter'>
      <button className='btn-close-container-filter-courses' onClick={onToggleCoursesForFilter}>{<TbXboxX/>}</button>

        {coursesFilter?.map((courseFilter)=>(
            <div key={courseFilter.id} className='container-course-filter' onClick={()=>loadInfoStudentRegisterByCourse(courseFilter.id)}>
                <img className='img-icon-course-filter' src={courseFilter.image} alt="" />
                <h3 className='title-icon-course-filter'>{courseFilter.name}</h3>
            </div>
        ))}

    </div>
  )
}
