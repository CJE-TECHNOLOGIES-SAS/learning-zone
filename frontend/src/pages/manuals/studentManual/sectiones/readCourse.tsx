import '../sectiones/styles/readCourse.css'
import imagen from '../../../../assets/learningZone/cursoss.png'
import image from '../../../../assets/learningZone/lecciones.png'

export const readCourse = ()=>{
    return (
        <div className="read-Course-Container">
            <h2 className="read-course-title">Cursos, lecciones y filtrado</h2>
            <ul className="read-course-list">
                <li>Ingresa al home principal, alli puedes ver los cursos o filtrarlos.</li>
                <li>Selecciona uno de los cursos disponibles.</li>
                <li>Accede a las lecciones disponibles y sigue el contenido en orden.</li>
            </ul>
            <br></br>
            <div className="container">
            <img src={imagen} alt="course " className="course-photo" />
            <img src={image} alt="lessons" className="lessons-photo" />
            </div>


            <p className="page-number">6</p>


        </div>

    )
    

}

export default readCourse;