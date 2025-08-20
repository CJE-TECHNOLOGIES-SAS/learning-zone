import '../sections/styles/coursesManagement.css'
import image from '../../../../assets/learningZone/courses.png'
export const CoursesManagement = () => {
  return (
    <div className="manual-coursesManagement">
      <h3 className="coursesManagement-title">Crear y gestionar cursos</h3>
      <ul className="courses-list">
        <li>Accede a home principal.</li>
        <li>Accede a el icono del más </li>
        <li>Y en el formulario ingresa la información para tu curso</li>
      </ul>
      <img src={image} alt="courses" className="coursess-photo" />

      <p className="page-number">6</p>

    </div>
  );
};
