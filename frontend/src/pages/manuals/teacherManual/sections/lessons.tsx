import '../sections/styles/lessons.css'
import imagen from '../../../../assets/learningZone/courses2.png'
import image from '../../../../assets/learningZone/lessons.png'
export const lessons = () => {
  return (
    <div className="student-progress-container">
      <h3 className="lessons-title">Editar cursos y lecciones</h3>
      <ul className="lessons-list">
        <li>Ingresa al home principal</li>
        <li>Allí accedes a un curso y podras editar tu curso y lección del curso</li>
      </ul>
      <br></br>
      <br></br>
      <div className="container">
        <img src={imagen} alt="course " className="courses-photo" />
        <img src={image} alt="lessons" className="lessons-photo" />
        </div>


    <p className="page-number">4</p>

    </div>
  );
};

export default lessons;