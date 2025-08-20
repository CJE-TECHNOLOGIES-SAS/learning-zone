import { useEffect } from "react";
import '../Styles/StudentPage.css'
import UpdateInformation from "../components/UpdateInformation";
import { useUser } from "../../auth/Hooks/useAuth";
import { useStudentCourseContext } from "../../courses/hooks/useCourse";
import { useNavigate } from "react-router-dom";
export default function StudentProfile() {
  const {user} = useUser()
  const {loadProgressLessons, progressLessons} = useStudentCourseContext()
  /* Agrehar en el contexto el loadCertificates */




  useEffect(()=>{
    loadProgressLessons()
  },[])
  let progressTotal = 0;
  for (let index = 0; index < progressLessons.length; index++) {
    progressTotal += progressLessons[index].completed_lessons;

  }
  const navigate = useNavigate()

  return (
    /* Reemplazar campos por lo del backend */
    <div className="container-profile-user">
        <h2 className="title-profile-user">Que te trae por aqui {user?.name}</h2>
        <div className="container-about-user">
            <section className="section-progress">
              <h2 className="title-progress">Proceso</h2>
              {/* Agg una etiqueta bolteada que diga en progreso o completad */}
              {progressLessons.map((progress)=>(
                <>
                  <p key={progress.id_course}
                  onClick={()=>navigate(`/student/course/${progress.id_course}/${progress.name_course}`) }
                  style={{'backgroundColor':progress.palette.accent}}>
                    {progress.name_course}
                  <span className="number-process">{progress.completed_lessons}/{progress.all_lessons}</span>

                  <span className="span-status-course" style={{'background':progress.status === 'complete'? '#59A9FF':'#FF7659'}}>{progress.status === 'complete'? 'Completo':'En progreso'}</span></p>



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
