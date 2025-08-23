import { useState } from 'react'
import CoursesForFilter from './CoursesForFilter'
import '../styles/OpcsFilter.css'
import { TbArrowsDownUp, TbXboxX } from 'react-icons/tb'   // menor → mayor
import { HiArrowsUpDown } from 'react-icons/hi2'  // mayor → menor
import { useManageStudents } from '../hook/useManageStudents'

type TSort = 'asc' | 'desc' | null
type Props = {
  onToggleOpcFilter: () => void; // cierra el panel externo
};
export default function OpcsFilter({onToggleOpcFilter}:Props) {

  const {refreshInfoStudentRegister} = useManageStudents()
  const [clickBtnFilterCourse, setClickBtnFilterCourse] = useState(false)
  const [sort, setSort] = useState<TSort>(null)

  const toggleAsc = () => setSort(prev => (prev === 'asc' ? null : 'asc'))
  const toggleDesc = () => setSort(prev => (prev === 'desc' ? null : 'desc'))
  const handleActionFilterCourse = (): void => {
      setClickBtnFilterCourse((prev) => !prev);
  };

  return (
    <div className="container-filter">
      <button className='btn-close-container-filter' onClick={onToggleOpcFilter}>{<TbXboxX/>}</button>

      <h2 className="title-container-filter">Filtrar Por</h2>
      <div className="container-opcs-filter">

          <button
            className="btn-filter-all"
            onClick={refreshInfoStudentRegister}
            aria-expanded={clickBtnFilterCourse}
            aria-controls="courses-filter-panel"
          >
            Todos
          </button>

          <button
            className="btn-filter-by-course"
            onClick={() => setClickBtnFilterCourse(!clickBtnFilterCourse)}
            aria-expanded={clickBtnFilterCourse}
            aria-controls="courses-filter-panel"
          >
            Curso
          </button>
          {clickBtnFilterCourse && (
              <CoursesForFilter onToggleCoursesForFilter ={handleActionFilterCourse}/>
          )}

          <div className="container-opc-filter-score">
            <p className="title-opc-filter-score">Puntuacion</p>

            {/* Menor → mayor */}
            <button
              type="button"
              className={`btn-score-asc ${sort === 'asc' ? 'is-active' : ''}`}
              onClick={toggleAsc}
              aria-pressed={sort === 'asc'}
              title="Ordenar: menor a mayor"
            >
              <TbArrowsDownUp />
            </button>

            {/* Mayor → menor */}
            <button
              type="button"
              className={`btn-score-desc ${sort === 'desc' ? 'is-active' : ''}`}
              onClick={toggleDesc}
              aria-pressed={sort === 'desc'}
              title="Ordenar: mayor a menor"
            >
              <HiArrowsUpDown />
            </button>
          </div>
        </div>
    </div>
  )
}
