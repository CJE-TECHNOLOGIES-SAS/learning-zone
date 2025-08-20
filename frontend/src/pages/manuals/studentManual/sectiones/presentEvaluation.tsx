import '../sectiones/styles/presentEvaluation.css'
import imagen from '../../../../assets/learningZone/evaluacion.png'
export const evaluationsManagement = () => {
    return (
        <div className="evaluation-management-container">
            <h3 className="evaluation-title">Presentar evaluaciones</h3>
            <ul className="manual-list">
                <li>Cada módulo tiene una evaluación al final.</li>
                <li>Haz clic en siguiente luego de finalizar una lección</li>
                <li>Al finalizar, recibirás tu nota automáticamente.</li>
            </ul>
            <img src={imagen} alt="evaluacion" className="evaluation-photo" />

        <p className="page-number">5</p>

        </div>
    );
};

export default evaluationsManagement;