import '../sections/styles/evaluationsManagement.css'
import image from '../../../../assets/learningZone/evaluations.png'
export const EvaluationsManagement = () => {
  return (
    <div className="evaluation-management-container">
      <h3 className="evaluation-title">Crear evaluaciones</h3>
      <ul className="manual-list">
        <li>Dentro de un curso crea una leccion y en el formulario puedes crear tu evaluación para esa lección.</li>
        <li>Crea preguntas abiertas o de opcion multiple</li>
      </ul>
      <img src={image} alt="evaluation" className="evaluation-photo" />

      <p className="page-number">5</p>

    </div>
  );
};