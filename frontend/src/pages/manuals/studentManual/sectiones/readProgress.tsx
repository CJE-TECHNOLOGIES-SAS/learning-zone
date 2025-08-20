import '../sectiones/styles/readProgress.css'
import imagen from '../../../../assets/learningZone/progress.png'
export const studentProgress = () => {
  return (
    <div className="student-progress-container">
      <h3 className="student-progress-title"> Ver su progreso con rol estudiante</h3>
      <ul className="student-progress-list">
        <li>Ingresa a al home principal</li>
        <li>Selecciona un curso</li>
        <li>Accede a las lecciones disponibles y allí se mostrara su progreso con su respectivo porcentaje.</li>
      </ul>
      <img src={imagen} alt="progreso " className="progress-photo" />


      <p className="page-number">4</p>

    </div>
  );
};

export default studentProgress;
