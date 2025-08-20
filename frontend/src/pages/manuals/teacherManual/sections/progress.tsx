import '../sections/styles/progress.css'
import imagen from '../../../../assets/learningZone/mi espacio.png'
import image from '../../../../assets/learningZone/notifications.png'
export const StudentProgress = () => {
  return (
    <div className="student-progress-container">
      <h3 className="student-progress-title">Gestión estudiantes y notificaciones</h3>
      <ul className="student-progress-list">
        <li>Ingresa a mi espacio.</li>
        <li>Allí podras ver y editar los estudiantes activos y registrados, ademas gestionar notificaciones</li>
      </ul>
      <br></br>
      <br></br>
      <div className="container">
        <img src={imagen} alt="course " className="students-photo" />
        <img src={image} alt="lessons" className="notifications-photo" />
        </div>


    <p className="page-number">4</p>

    </div>
  );
};
