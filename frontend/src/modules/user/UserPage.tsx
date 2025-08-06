import { useEffect } from "react";
import { useUser } from "../auth/Hooks/useAuth";
import { useCourseContext } from "../courses/hooks/useCourse";
import UpdateInformation from "./Components/UpdateInformation";
import './Styles/UserPage.css'
import { useNavigationHandler, type AppRoutes } from "../../hooks/useNavigationHandler";
import type { TCourse } from "../courses/types/Course";
export default function UserPage() {
  const {student} = useUser()
  const {loadLessonsCourse,loadProgressLessons, progressLessons} = useCourseContext()
  /* Agrehar en el contexto el loadCertificates */
  const handleBtnNavigate = useNavigationHandler()


  const handleClickCourseProgress =(id:TCourse['id'], nameRoute:string)=>{
      loadLessonsCourse(id) /* Ejecutar funcion del hook que trae las lecciones */
      const route:AppRoutes | string = nameRoute
      handleBtnNavigate(route)/* Redirijir al home del curso */
  }



  useEffect(()=>{
    loadProgressLessons()
  },[])
  let progressTotal = 0;
  for (let index = 0; index < progressLessons.length; index++) {
    progressTotal += progressLessons[index].completed_lessons;
    
  }

  return (
    /* Reemplazar campos por lo del backend */
    <div className="container-profile-user">
        <h2 className="title-profile-user">Que te trae por aqui {student?.name}</h2>
        <div className="container-about-user">
            <section className="section-progress">
              <h2 className="title-progress">Proceso</h2>
              {/* Agg una etiqueta bolteada que diga en progreso o completad */}
              {progressLessons.map((progress)=>(
                <>
                  <p key={progress.id_course} onClick={()=>handleClickCourseProgress(progress.id_course,`/${progress.name_course}`)} className={`progress-course-${progress.name_course.toLowerCase()}`}>{progress.name_course} <span className="number-process">{progress.completed_lessons}/{progress.all_lessons}</span><span className="span-status-course" style={{'background':progress.status === 'completed'? '#59A9FF':'#FF7659'}}>{progress.status === 'completed'? 'Completo':'En progreso'}</span></p>

                 
                
                </>
                ))}
              <p className="progress-main">{progressTotal}</p>
            </section>
            <section className="section-info-user">
                <UpdateInformation/>
            </section>


        </div>

    </div>
  )
}
