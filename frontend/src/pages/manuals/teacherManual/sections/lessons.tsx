import '../sections/styles/lessons.css'
import imagen from '../../../../assets/learningZone/courses2.png'
import image from '../../../../assets/learningZone/lessons.png'
export const lessons = () => {
  return (
    <div className="student-progress-container">
      <h3 className="lessons-title">Editar cursos y lecciones</h3>
      <ul className="lessons-list">
        <li>Ingresa al home principal</li>
        <li>Allí puedes ingresar, editar o crear tu curso y lección teniendo en cuenta que para crear un curso debes tener al menos 7 lecciones creadas </li>
      </ul>
      <br></br>
      <br></br>
      <div className="container">
        <img src={imagen} alt="course " className="courses-photo" />
        <img src={image} alt="lessons" className="lessons-photo" />
        </div>
    <p className="page-number">6</p>
    </div>
  );
};

export default lessons;